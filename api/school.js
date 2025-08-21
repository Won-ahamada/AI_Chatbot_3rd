// Simple keyword detector for school queries
function isSchoolQuery(msg) {
  const keywords = ["학교", "초등학교", "중학교", "고등학교", "유치원", "교육청"];
  return keywords.some((kw) => msg.includes(kw));
}

// 📌 If it's a school query → call /api/school
if (isSchoolQuery(message)) {
  try {
    // Clean user input (remove filler words like "알려줘", "정보", "검색")
    const schoolQuery = message
      .replace(/(알려줘|정보|검색|찾아줘|어디|문의)/g, "")
      .trim();

    const baseUrl = process.env.BASE_URL || "http://localhost:3000";
    const schoolRes = await fetch(
      `${baseUrl}/api/school?schoolName=${encodeURIComponent(schoolQuery)}`
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