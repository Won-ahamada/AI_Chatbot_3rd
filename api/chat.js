export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Gemini API key not configured" });
    }

    // 🔎 Debug log
    console.log("Incoming message:", message);

    // Call Gemini API
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
      return res.status(response.status).json({ error: "Gemini API request failed", details: errorText });
    }

    const data = await response.json();

    // Extract response text safely
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