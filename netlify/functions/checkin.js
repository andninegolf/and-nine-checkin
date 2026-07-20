// netlify/functions/checkin.js
//
// Receives the check-in payload from the React form and writes it to
// Airtable. The Airtable Personal Access Token lives only here, as a
// Netlify environment variable — never in the browser-side code.

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
  const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME || "Check-Ins";

  if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server is missing Airtable configuration." }),
    };
  }

  // Map the form payload's field names to your Airtable column names.
  const fields = {
    Name: payload.name || "",
    Email: payload.email || "",
    "Dominant Hand": payload.dominantHand || "",
    "Experience Level": payload.experienceLevel || "",
    "Waiver Agreed": !!payload.waiverAgreed,
    "Safety Rules Agreed": !!payload.safetyRulesAgreed,
    Signature: payload.signature || "",
    "Signed On Behalf Of Minor": !!payload.signedOnBehalfOfMinor,
    "Minor Name": payload.minorName || "",
    "Guardian Name": payload.guardianName || "",
    "Opt In Updates": !!payload.optInUpdates,
    "Submitted At": payload.submittedAt || new Date().toISOString(),
  };

  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AIRTABLE_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fields }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: "Airtable rejected the request", details: data }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, recordId: data.id }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to reach Airtable", details: err.message }),
    };
  }
};
