export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Simple keyword detector for school queries
    function isSchoolQuery(msg) {
      const keywords = ["학교", "초등학교", "중학교", "고등학교", "유치원", "교육청"];
      return keywords.some((kw) => msg.includes(kw));
    }

    // 📌 If it's a school query → call /api/school
    if (isSchoolQuery(message)) {
      try {
        const schoolRes = await fetch(
          `${process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : "http://localhost:3000"}/api/school?schoolName=${encodeURIComponent(message)}`
        );

        if (!schoolRes.ok) {
          throw new Error("School API request failed");
        }

        const schoolData = await schoolRes.json();

        // Format schools list into readable text
        if (schoolData.schools && schoolData.schools.length > 0) {
          const formatted = schoolData.schools
            .map(
              (s, i) =>
                `${i + 1}. ${s.name} (${s.type})\n   위치: ${s.location}\n   주소: ${s.address}\n   전화: ${s.phone}\n   홈페이지: ${s.website}`
            )
            .join("\n\n");

          return res.status(200).json({
            response: `🔎 학교 검색 결과:\n\n${formatted}`,
            timestamp: new Date().toISOString(),
          });
        } else {
          return res.status(200).json({
            response: "해당 조건에 맞는 학교 정보를 찾을 수 없습니다.",
            timestamp: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.error("School API error:", err);
        return res.status(500).json({ error: "학교 정보 검색 실패" });
      }
    }

    // 📌 Otherwise → fallback to Gemini API
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Gemini API key not configured" });
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `당신은 한국교육학술정보원(KERIS)의 AI Assistant입니다. 
교육 디지털 혁신과 정책 관련 질문에 전문적으로 답변해주세요. 
항상 친근하고 전문적인 톤으로 한국어로 응답하세요.`
                }
              ]
            },
            {
              role: "user",
              parts: [{ text: message }]
            }
          ]
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API Error Response:", errorText);
      return res.status(response.status).json({ error: "Gemini API request failed" });
    }

    const data = await response.json();
    const aiResponse =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "응답을 불러올 수 없습니다.";

    return res.status(200).json({
      response: aiResponse,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Chat API Error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
}