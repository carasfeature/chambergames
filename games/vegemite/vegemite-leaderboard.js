    const VEGEMITE_SUPABASE_URL = "https://sqqmdnamtnszarfdafgo.supabase.co";
    const VEGEMITE_SUPABASE_KEY = "sb_publishable_CbAVFAAByPDAbDxBCF1hCg_jG0Tyv_j";

    async function loadVegemiteLeaderboard() {
      const response = await fetch(
        `${VEGEMITE_SUPABASE_URL}/rest/v1/vegemite_scores?select=display_name,twitch_login,best_score&order=best_score.desc&limit=10`,
        {
          headers: {
            apikey: VEGEMITE_SUPABASE_KEY,
            Authorization: `Bearer ${VEGEMITE_SUPABASE_KEY}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    }

    function safeLeaderboardName(value) {
      return String(value || "PLAYER")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    }

    const leaderboardButton = document.createElement("button");
    leaderboardButton.type = "button";
    leaderboardButton.className = "big-btn dark";
    leaderboardButton.textContent = "LEADERBOARD";

    const menuActions = document.querySelector("#menuScreen .menu-actions");

    if (menuActions) {
      menuActions.appendChild(leaderboardButton);
    }

    const leaderboardScreen = document.createElement("div");
    leaderboardScreen.className = "vegemite-leaderboard-screen hidden";
    leaderboardScreen.innerHTML = `
      <div class="vegemite-leaderboard-card">
        <div class="vegemite-leaderboard-head">
          <div>
            <div class="kicker">GLOBAL LEADERBOARD</div>
            <h2>TOP 10 HEISTS</h2>
          </div>
          <button type="button" class="vegemite-leaderboard-close">×</button>
        </div>
        <div class="vegemite-leaderboard-rows"></div>
      </div>
    `;

    document.body.appendChild(leaderboardScreen);

    const leaderboardRows = leaderboardScreen.querySelector(".vegemite-leaderboard-rows");
    const leaderboardClose = leaderboardScreen.querySelector(".vegemite-leaderboard-close");

    async function openVegemiteLeaderboard() {
      leaderboardRows.innerHTML = `<div class="vegemite-leaderboard-message">LOADING...</div>`;
      leaderboardScreen.classList.remove("hidden");

      try {
        const rows = await loadVegemiteLeaderboard();

        if (!rows.length) {
          leaderboardRows.innerHTML = `<div class="vegemite-leaderboard-message">NO SCORES YET</div>`;
          return;
        }

        leaderboardRows.innerHTML = rows.map((row, index) => {
          const name = safeLeaderboardName(row.display_name || row.twitch_login);
          const score = Number(row.best_score) || 0;

          return `
            <div class="vegemite-leaderboard-row">
              <span class="vegemite-leaderboard-rank">#${index + 1}</span>
              <span class="vegemite-leaderboard-name">${name}</span>
              <strong class="vegemite-leaderboard-score">${score}</strong>
            </div>
          `;
        }).join("");
      } catch (error) {
        console.error("[vegemite] leaderboard error:", error);
        leaderboardRows.innerHTML = `<div class="vegemite-leaderboard-message">COULDN'T LOAD SCORES</div>`;
      }
    }

    function closeVegemiteLeaderboard() {
      leaderboardScreen.classList.add("hidden");
    }

    leaderboardButton.addEventListener("click", openVegemiteLeaderboard);
    leaderboardClose.addEventListener("click", closeVegemiteLeaderboard);

    leaderboardScreen.addEventListener("click", event => {
      if (event.target === leaderboardScreen) {
        closeVegemiteLeaderboard();
      }
    });

    const leaderboardStyle = document.createElement("style");
    leaderboardStyle.textContent = `
      .vegemite-leaderboard-screen {
        position: fixed;
        inset: 0;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(15, 10, 7, .78);
        backdrop-filter: blur(3px);
      }

      .vegemite-leaderboard-screen.hidden {
        display: none;
      }

      .vegemite-leaderboard-card {
        width: min(520px, calc(100% - 40px));
        max-height: calc(100vh - 50px);
        overflow: auto;
        padding: 24px;
        background: #f4dfaa;
        color: #24180f;
        border: 4px solid #24180f;
        box-shadow: 10px 10px 0 rgba(0, 0, 0, .3);
      }

      .vegemite-leaderboard-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        margin-bottom: 18px;
      }

      .vegemite-leaderboard-head h2 {
        margin: 5px 0 0;
        font: inherit;
        font-size: 30px;
        font-weight: 900;
      }

      .vegemite-leaderboard-close {
        width: 44px;
        height: 44px;
        border: 3px solid #24180f;
        background: #d9553f;
        color: white;
        font: inherit;
        font-size: 25px;
        font-weight: 900;
        cursor: pointer;
      }

      .vegemite-leaderboard-row {
        display: grid;
        grid-template-columns: 55px minmax(0, 1fr) auto;
        align-items: center;
        gap: 12px;
        min-height: 50px;
        border-bottom: 2px solid rgba(36, 24, 15, .2);
      }

      .vegemite-leaderboard-rank,
      .vegemite-leaderboard-name,
      .vegemite-leaderboard-score {
        font-weight: 900;
      }

      .vegemite-leaderboard-name {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .vegemite-leaderboard-score {
        font-size: 21px;
      }

      .vegemite-leaderboard-message {
        padding: 30px 5px 15px;
        text-align: center;
        font-weight: 900;
      }
    `;

    document.head.appendChild(leaderboardStyle);
