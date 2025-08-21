export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      schoolName,
      educationOfficeCode,
      schoolCode,
      schoolType,
      locationName,
      foundationType,
      pageIndex = 1,
      pageSize = 10,
      format = "json",
    } = req.query;

    const API_BASE_URL = "https://open.neis.go.kr/hub/schoolInfo";
    const API_KEY = process.env.NEIS_API_KEY; // ⚠️ add your key to .env

    const url = new URL(API_BASE_URL);
    url.searchParams.set("KEY", API_KEY);
    url.searchParams.set("Type", format);
    url.searchParams.set("pIndex", pageIndex);
    url.searchParams.set("pSize", pageSize);

    if (educationOfficeCode) url.searchParams.set("ATPT_OFCDC_SC_CODE", educationOfficeCode);
    if (schoolCode) url.searchParams.set("SD_SCHUL_CODE", schoolCode);
    if (schoolName) url.searchParams.set("SCHUL_NM", schoolName);
    if (schoolType) url.searchParams.set("SCHUL_KND_SC_NM", schoolType);
    if (locationName) url.searchParams.set("LCTN_SC_NM", locationName);
    if (foundationType) url.searchParams.set("FOND_SC_NM", foundationType);

    const response = await fetch(url.toString());
    if (!response.ok) {
      return res.status(response.status).json({ error: "NEIS API request failed" });
    }

    const data = await response.json();

    // Format response for chatbot readability
    if (data?.schoolInfo?.[1]?.row) {
      const schools = data.schoolInfo[1].row.map((s) => ({
        name: s.SCHUL_NM,
        type: s.SCHUL_KND_SC_NM,
        code: s.SD_SCHUL_CODE,
        location: s.LCTN_SC_NM,
        address: s.ORG_RDNMA || "N/A",
        phone: s.ORG_TELNO || "N/A",
        website: s.HMPG_ADRES || "N/A",
        founded: s.FOND_YMD || "N/A",
      }));
      return res.status(200).json({ schools });
    } else {
      return res.status(404).json({ message: "No schools found" });
    }
  } catch (error) {
    console.error("School API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}