const express = require("express");
const fetch = require("node-fetch");
const path = require("path");
const app = express();
const clientId = "clientId";
const clientSecret = "clientSecret";
let accessToken = "";
async function getAccessToken() {
  try {
    const response = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, grant_type: "client_credentials" }),
    });
    const data = await response.json();
    accessToken = data.access_token;
    console.log("Access token obtained:", accessToken);
  } catch (error) {
    console.error("Error obtaining access token:", error);
  }
}
async function fetchData(query) {
  try {
    console.log("Sending request with query:", query);
    const response = await fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: {
        "Client-ID": clientId,
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      body: query,
    });
    const data = await response.json();
    console.log("Raw response data:", data);
    return data;
  } catch (error) {
    console.error("Error fetching data from IGDB:", error);
    throw error;
  }
}
app.use(express.static(path.join(__dirname, "public")));
app.get("/games", async (req, res) => {
  if (!accessToken) await getAccessToken();
  try {
    const query = "fields id, name, genres.name, first_release_date, summary; limit 10;";
    const games = await fetchData(query);
    res.json(games);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data from IGDB" });
  }
});
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
