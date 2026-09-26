
    const SUPABASE_URL = "https://sqqmdnamtnszarfdafgo.supabase.co";
    const SUPABASE_KEY = "sb_publishable_CbAVFAAByPDAbDxBCF1hCg_jG0Tyv_j";

    function getSavedTwitchUser() {
      try {
        return JSON.parse(localStorage.getItem("twitchUser") || "null");
      } catch {
        return null;
      }
    }

    async function saveVegemiteScore(scoreToSave) {
      const user = getSavedTwitchUser();

      if (!user) {
        console.warn("[vegemite] No Twitch user found. Score not sent.");
        return;
      }

      const twitchLogin = String(
        user.login || user.twitch_login || ""
      ).trim().toLowerCase();

      const displayName = String(
        user.display_name || user.displayName || twitchLogin
      ).trim();

      const twitchId = String(
        user.id || user.twitch_id || twitchLogin
      ).trim();

      if (!twitchId || !twitchLogin) {
        console.warn("[vegemite] Twitch user data is missing.");
        return;
      }

      const headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json"
      };

      try {
        const lookup =
          `${SUPABASE_URL}/rest/v1/vegemite_scores` +
          `?twitch_id=eq.${encodeURIComponent(twitchId)}` +
          `&select=best_score`;

        const existingResponse = await fetch(lookup, {
          method: "GET",
          headers
        });

        if (!existingResponse.ok) {
          throw new Error(
            `Score lookup failed: ${existingResponse.status} ${await existingResponse.text()}`
          );
        }

        const rows = await existingResponse.json();
        const existingBest = Number(rows?.[0]?.best_score || 0);

        if (existingBest >= scoreToSave) {
          console.log(`[vegemite] Global best stays at ${existingBest}.`);
          return;
        }

        const payload = {
          twitch_id: twitchId,
          twitch_login: twitchLogin,
          display_name: displayName,
          best_score: scoreToSave,
          updated_at: new Date().toISOString()
        };

        const saveResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/vegemite_scores?on_conflict=twitch_id`,
          {
            method: "POST",
            headers: {
              ...headers,
              "Prefer": "resolution=merge-duplicates,return=minimal"
            },
            body: JSON.stringify(payload)
          }
        );

        if (!saveResponse.ok) {
          throw new Error(
            `Score save failed: ${saveResponse.status} ${await saveResponse.text()}`
          );
        }

        console.log(`[vegemite] Saved global best ${scoreToSave} for ${twitchLogin}.`);
      } catch (error) {
        console.error("[vegemite] Supabase score error:", error);
      }
    }

    

    const menuScreen =
      document.getElementById("menuScreen");

    const settingsScreen =
      document.getElementById("settingsScreen");

    const menuStartBtn =
      document.getElementById("menuStartBtn");

    const settingsBtn =
      document.getElementById("settingsBtn");

    const closeSettingsBtn =
      document.getElementById("closeSettingsBtn");


    const guardDog =
      document.getElementById("guardDog");

    const dogSprite =
      document.getElementById("dogSprite");


    const soundToggle =
      document.getElementById("soundToggle");

    const volumeSlider =
      document.getElementById("volumeSlider");

    const shakeToggle =
      document.getElementById("shakeToggle");

    const flashToggle =
      document.getElementById("flashToggle");

    const resetBestBtn =
      document.getElementById("resetBestBtn");


    const muteBtn =
      document.getElementById("muteBtn");

    const pauseBtn =
      document.getElementById("pauseBtn");

    const resumeBtn =
      document.getElementById("resumeBtn");

    const quitBtn =
      document.getElementById("quitBtn");


    const toastBtn =
      document.getElementById("toastBtn");

    const hideBtn =
      document.getElementById("hideBtn");


    const scoreEl =
      document.getElementById("score");

    const bestEl =
      document.getElementById("best");

    const plateScore =
      document.getElementById("plateScore");


    const amber =
      document.getElementById("amber");

    const amberSprite =
      document.getElementById("amberSprite");


    const christina =
      document.getElementById("christina");

    const christinaSprite =
      document.getElementById("christinaSprite");


    const warning =
      document.getElementById("warning");

    const warningTitle =
      document.getElementById("warningTitle");

    const warningText =
      document.getElementById("warningText");

    const statusBubble =
      document.getElementById("statusBubble");


    const progressBar =
      document.getElementById("progressBar");

    const progressPercent =
      document.getElementById("progressPercent");

    const stepLabel =
      document.getElementById("stepLabel");


    const stepBread =
      document.getElementById("stepBread");

    const stepButter =
      document.getElementById("stepButter");

    const stepVegemite =
      document.getElementById("stepVegemite");

    const stepDone =
      document.getElementById("stepDone");


    const pauseOverlay =
      document.getElementById("pauseOverlay");

    const gameOverOverlay =
      document.getElementById("gameOverOverlay");

    const gameArea =
      document.getElementById("gameArea");


    const finalScore =
      document.getElementById("finalScore");

    const bestMessage =
      document.getElementById("bestMessage");

    const restartBtn =
      document.getElementById("restartBtn");

    const menuBtn =
      document.getElementById("menuBtn");




    const amberPoses = {
      idle:
        "assets/characters/amber-idle.png",

      cooking:
        "assets/characters/amber-cooking.png",

      looking:
        "assets/characters/amber-looking.png",

      hiding:
        "assets/characters/amber-hiding.png"
    };


    const christinaPoses = {
      arriving:
        "assets/characters/christina-arriving.png",

      peeking:
        "assets/characters/christina-peeking.png",

      caught:
        "assets/characters/christina-caught.png"
    };


    const DOG_IDLE =
      "assets/characters/dog-idle.png";

    const DOG_ALERT =
      "assets/characters/dog-alert.png";




    function setAmberPose(pose) {

      if (!amberPoses[pose]) {
        return;
      }


      amberSprite.src =
        amberPoses[pose];


      amber.classList.remove(
        "making",
        "looking",
        "hiding",

        "pose-idle",
        "pose-cooking",
        "pose-looking",
        "pose-hiding"
      );


      amber.classList.add(
        `pose-${pose}`
      );


      if (pose === "cooking") {
        amber.classList.add("making");
      }


      if (pose === "looking") {
        amber.classList.add("looking");
      }


      if (pose === "hiding") {
        amber.classList.add("hiding");
      }
    }


    function setChristinaPose(pose) {

      if (!christinaPoses[pose]) {
        return;
      }


      christinaSprite.src =
        christinaPoses[pose];


      christina.classList.remove(
        "arriving",
        "peeking",
        "caught",

        "pose-arriving",
        "pose-peeking",
        "pose-caught"
      );


      christina.classList.add(pose);

      christina.classList.add(
        `pose-${pose}`
      );
    }


    function setDogIdle() {

      if (!dogSprite || !guardDog) {
        return;
      }


      dogSprite.src =
        DOG_IDLE;


      guardDog.classList.remove(
        "alert"
      );
    }


    function setDogAlert() {

      if (!dogSprite || !guardDog) {
        return;
      }


      dogSprite.src =
        DOG_ALERT;


      guardDog.classList.add(
        "alert"
      );
    }



    const defaultSettings = {
      sound: true,
      volume: 70,
      shake: true,
      flash: true
    };


    let settings =
      loadSettings();


    function loadSettings() {

      try {

        const saved =
          JSON.parse(
            localStorage.getItem(
              "vegemiteHeistSettings"
            )
          );


        return {
          ...defaultSettings,
          ...(saved || {})
        };


      } catch {

        return {
          ...defaultSettings
        };
      }
    }


    function saveSettings() {

      localStorage.setItem(
        "vegemiteHeistSettings",
        JSON.stringify(settings)
      );
    }


    function updateSettingsUI() {

      soundToggle.textContent =
        settings.sound
          ? "ON"
          : "OFF";


      soundToggle.classList.toggle(
        "off",
        !settings.sound
      );


      shakeToggle.textContent =
        settings.shake
          ? "ON"
          : "OFF";


      shakeToggle.classList.toggle(
        "off",
        !settings.shake
      );


      flashToggle.textContent =
        settings.flash
          ? "ON"
          : "OFF";


      flashToggle.classList.toggle(
        "off",
        !settings.flash
      );


      volumeSlider.value =
        settings.volume;


      muteBtn.textContent =
        settings.sound
          ? "SOUND ON"
          : "MUTED";
    }



    let audioContext = null;


    function getAudioContext() {

      if (!audioContext) {

        audioContext =
          new (
            window.AudioContext ||
            window.webkitAudioContext
          )();
      }


      if (
        audioContext.state ===
        "suspended"
      ) {

        audioContext.resume();
      }


      return audioContext;
    }


    function beep(
      frequency = 440,
      duration = .08,
      type = "square",
      volume = .15
    ) {

      if (!settings.sound) {
        return;
      }


      const ctx =
        getAudioContext();


      const oscillator =
        ctx.createOscillator();


      const gain =
        ctx.createGain();


      oscillator.type =
        type;


      oscillator.frequency.value =
        frequency;


      const master =
        settings.volume / 100;


      gain.gain.setValueAtTime(
        volume * master,
        ctx.currentTime
      );


      gain.gain.exponentialRampToValueAtTime(
        .001,
        ctx.currentTime + duration
      );


      oscillator.connect(gain);

      gain.connect(
        ctx.destination
      );


      oscillator.start();


      oscillator.stop(
        ctx.currentTime + duration
      );
    }



    function playDogBark() {

      if (!settings.sound) {
        return;
      }


      const ctx =
        getAudioContext();


      const master =
        settings.volume / 100;


      function bark(
        delay,
        startPitch
      ) {

        const oscillator =
          ctx.createOscillator();


        const gain =
          ctx.createGain();


        oscillator.type =
          "sawtooth";


        oscillator.frequency.setValueAtTime(
          startPitch,
          ctx.currentTime + delay
        );


        oscillator.frequency.exponentialRampToValueAtTime(
          70,
          ctx.currentTime +
          delay +
          .13
        );


        gain.gain.setValueAtTime(
          .001,
          ctx.currentTime + delay
        );


        gain.gain.linearRampToValueAtTime(
          .18 * master,
          ctx.currentTime +
          delay +
          .015
        );


        gain.gain.exponentialRampToValueAtTime(
          .001,
          ctx.currentTime +
          delay +
          .17
        );


        oscillator.connect(gain);

        gain.connect(
          ctx.destination
        );


        oscillator.start(
          ctx.currentTime + delay
        );


        oscillator.stop(
          ctx.currentTime +
          delay +
          .18
        );
      }


      

      bark(0, 170);

      bark(.20, 145);
    }



    function playToastSound() {

      beep(
        420,
        .06,
        "square",
        .08
      );
    }


    function playToastComplete() {

      beep(
        480,
        .08,
        "square",
        .12
      );


      setTimeout(() => {

        beep(
          700,
          .1,
          "square",
          .11
        );

      }, 70);
    }


    function playFootsteps() {

      beep(
        100,
        .12,
        "triangle",
        .18
      );


      setTimeout(() => {

        beep(
          85,
          .12,
          "triangle",
          .18
        );

      }, 180);
    }


    function playHideSound() {

      beep(
        180,
        .08,
        "triangle",
        .1
      );
    }


    function playSafeSound() {

      beep(
        500,
        .07,
        "sine",
        .09
      );


      setTimeout(() => {

        beep(
          620,
          .1,
          "sine",
          .08
        );

      }, 80);
    }


    function playCaughtSound() {

      beep(
        90,
        .35,
        "sawtooth",
        .24
      );
    }


    let score = 0;


    let best =
      Number(
        localStorage.getItem(
          "vegemiteHeistBest"
        )
      ) || 0;


    let gameRunning = false;

    let paused = false;

    let makingToast = false;

    let hidden = false;

    let dangerActive = false;

    let fakeWarning = false;


    let visitTimer = null;

    let warningTimer = null;

    let toastTimer = null;

    let hideTimer = null;

    let christinaStageTimer = null;


    bestEl.textContent =
      best;



    function getDifficulty() {

      const round =
        score;


      return {


        visitMin:
          Math.max(
            1400,
            5200 -
            round * 220
          ),


        visitMax:
          Math.max(
            2300,
            7800 -
            round * 260
          ),


        warningTime:
          Math.max(
            350,
            2000 -
            round * 100
          ),


       
        arrivalTime:
          Math.max(
            180,
            650 -
            round * 35
          ),



        catchTime:
          Math.max(
            120,
            900 -
            round * 55
          ),


       

        toastTime:
          Math.max(
            850,
            1900 -
            round * 35
          ),


     

        fakeChance:
          round < 3
            ? 0
            : Math.min(
                .35,
                .08 +
                round * .012
              )
      };
    }


    function randomBetween(
      min,
      max
    ) {

      return (
        Math.random() *
        (max - min) +
        min
      );
    }



    function clearTimers() {

      clearTimeout(
        visitTimer
      );


      clearTimeout(
        warningTimer
      );


      clearTimeout(
        hideTimer
      );


      clearTimeout(
        christinaStageTimer
      );


      clearInterval(
        toastTimer
      );


      visitTimer = null;

      warningTimer = null;

      hideTimer = null;

      christinaStageTimer = null;

      toastTimer = null;
    }



    function startGame() {

      clearTimers();


      score = 0;


      gameRunning = true;

      paused = false;

      makingToast = false;

      hidden = false;

      dangerActive = false;

      fakeWarning = false;


      scoreEl.textContent =
        0;


      plateScore.textContent =
        0;


      bestEl.textContent =
        best;


      menuScreen.classList.add(
        "hidden"
      );


      settingsScreen.classList.add(
        "hidden"
      );


      pauseOverlay.classList.add(
        "hidden"
      );


      gameOverOverlay.classList.add(
        "hidden"
      );


      warning.classList.add(
        "hidden"
      );



      christina.classList.add(
        "hidden"
      );


      christina.classList.remove(
        "entered"
      );


      setAmberPose(
        "idle"
      );


      setChristinaPose(
        "arriving"
      );


    

      setDogIdle();


      resetProgress();


      toastBtn.disabled =
        false;


      hideBtn.disabled =
        false;


      statusBubble.textContent =
        "Amber is ready. Start making toast.";


      scheduleChristina();
    }



    function makeToast() {

      if (
        !gameRunning ||
        paused ||
        makingToast ||
        hidden
      ) {

        return;
      }


      makingToast =
        true;


      toastBtn.disabled =
        true;


      setAmberPose(
        "cooking"
      );


      const difficulty =
        getDifficulty();


      const duration =
        difficulty.toastTime;


      const startTime =
        performance.now();


      statusBubble.textContent =
        "Amber is making Vegemite toast...";


      toastTimer =
        setInterval(() => {


          if (
            paused ||
            !gameRunning
          ) {

            return;
          }


          const elapsed =
            performance.now() -
            startTime;


          const progress =
            Math.min(
              elapsed / duration,
              1
            );


          updateProgress(
            progress
          );


          if (
            progress >= 1
          ) {

            clearInterval(
              toastTimer
            );


            toastTimer =
              null;


            completeToast();
          }


        }, 35);
    }


    function completeToast() {

      makingToast =
        false;


      score++;


      scoreEl.textContent =
        score;


      plateScore.textContent =
        score;


      playToastComplete();


      resetProgress();




      if (!hidden) {

        setAmberPose(
          "idle"
        );
      }


      toastBtn.disabled =
        hidden;


      statusBubble.textContent =
        `Toast #${score} complete. Can you risk another?`;
    }



    function updateProgress(
      progress
    ) {

      const percent =
        Math.round(
          progress * 100
        );


      progressBar.style.width =
        `${percent}%`;


      progressPercent.textContent =
        `${percent}%`;


      stepBread.classList.remove(
        "active"
      );


      stepButter.classList.remove(
        "active"
      );


      stepVegemite.classList.remove(
        "active"
      );


      stepDone.classList.remove(
        "active"
      );


      if (
        progress < .25
      ) {

        stepLabel.textContent =
          "BREAD";


        stepBread.classList.add(
          "active"
        );


      } else if (
        progress < .5
      ) {

        stepLabel.textContent =
          "BUTTER";


        stepButter.classList.add(
          "active"
        );


      } else if (
        progress < .9
      ) {

        stepLabel.textContent =
          "VEGEMITE";


        stepVegemite.classList.add(
          "active"
        );


      } else {

        stepLabel.textContent =
          "DONE";


        stepDone.classList.add(
          "active"
        );
      }


      if (
        percent === 25 ||
        percent === 50 ||
        percent === 75
      ) {

        playToastSound();
      }
    }


    function resetProgress() {

      progressBar.style.width =
        "0%";


      progressPercent.textContent =
        "0%";


      stepLabel.textContent =
        "READY";


      [
        stepBread,
        stepButter,
        stepVegemite,
        stepDone

      ].forEach(step => {

        step.classList.remove(
          "active"
        );
      });
    }


    function scheduleChristina() {

      if (
        !gameRunning ||
        paused
      ) {

        return;
      }


      const difficulty =
        getDifficulty();


      visitTimer =
        setTimeout(

          beginWarning,

          randomBetween(
            difficulty.visitMin,
            difficulty.visitMax
          )
        );
    }


    function beginWarning() {

      if (
        !gameRunning ||
        paused
      ) {

        return;
      }


      setDogAlert();


      playDogBark();


      dangerActive =
        true;


      hidden =
        false;


      const difficulty =
        getDifficulty();


      fakeWarning =
        Math.random() <
        difficulty.fakeChance;


      warning.classList.remove(
        "hidden"
      );


      warningTitle.textContent =
        "FOOTSTEPS...";


      warningText.textContent =
        "Christina might be coming.";


      statusBubble.textContent =
        "The dog heard something...";


  

      if (!makingToast) {

        setAmberPose(
          "idle"
        );
      }


      playFootsteps();


      if (
        settings.flash
      ) {

        gameArea.classList.add(
          "screen-danger"
        );


        setTimeout(() => {

          gameArea.classList.remove(
            "screen-danger"
          );

        }, 600);
      }


      warningTimer =
        setTimeout(

          resolveWarning,

          difficulty.warningTime
        );
    }



    function resolveWarning() {

      warningTimer =
        null;


      if (!gameRunning) {
        return;
      }


      const difficulty =
        getDifficulty();



      if (fakeWarning) {

        warning.classList.add(
          "hidden"
        );


        dangerActive =
          false;


        fakeWarning =
          false;


       

        setDogIdle();


        if (hidden) {

          hidden =
            false;


          setAmberPose(
            "idle"
          );


          toastBtn.disabled =
            false;


          hideBtn.disabled =
            false;

        } else if (
          !makingToast
        ) {

          setAmberPose(
            "idle"
          );
        }


        statusBubble.textContent =
          "False alarm. Keep going.";


        playSafeSound();


        scheduleChristina();


        return;
      }


      warning.classList.add(
        "hidden"
      );



      christina.classList.remove(
        "entered"
      );


      setChristinaPose(
        "arriving"
      );


      christina.classList.remove(
        "hidden"
      );


      statusBubble.textContent =
        "Christina is coming...";


      christinaStageTimer =
        setTimeout(() => {


          if (
            !gameRunning ||
            paused
          ) {

            return;
          }



          setChristinaPose(
            "peeking"
          );


          statusBubble.textContent =
            "Christina is checking the kitchen...";


          christinaStageTimer =
            setTimeout(() => {


              if (
                !gameRunning ||
                paused
              ) {

                return;
              }


              if (hidden) {

                safeFromChristina();

              } else {

                caught();
              }


            }, difficulty.catchTime);


        }, difficulty.arrivalTime);
    }

    function safeFromChristina() {


      christina.classList.remove(
        "entered"
      );


      statusBubble.textContent =
        "Christina didn't find anything.";


      playSafeSound();


      christinaStageTimer =
        setTimeout(() => {


          if (!gameRunning) {

            return;
          }


          christina.classList.add(
            "hidden"
          );


          christina.classList.remove(
            "entered"
          );


          dangerActive =
            false;


          hidden =
            false;


          fakeWarning =
            false;


          setAmberPose(
            "idle"
          );


          setChristinaPose(
            "arriving"
          );


          setDogIdle();


          toastBtn.disabled =
            false;


          hideBtn.disabled =
            false;


          statusBubble.textContent =
            "She left. Keep making toast.";


          scheduleChristina();


        }, 850);
    }


    function hideEverything() {

      if (
        !gameRunning ||
        paused ||
        hidden
      ) {

        return;
      }

if (makingToast) {
  clearInterval(toastTimer);
  toastTimer = null;
  makingToast = false;
  resetProgress();
}
      hidden =
        true;


      toastBtn.disabled =
        true;


     

      setAmberPose(
        "hiding"
      );


      playHideSound();


      if (dangerActive) {

        statusBubble.textContent =
          "Amber hides everything and ducks down...";


      } else {

       

        statusBubble.textContent =
          "No footsteps. You hid for nothing.";


        hideBtn.disabled =
          true;


        hideTimer =
          setTimeout(() => {


            if (!gameRunning) {

              return;
            }


            hidden =
              false;


            setAmberPose(
              "idle"
            );


            toastBtn.disabled =
              false;


            hideBtn.disabled =
              false;


            statusBubble.textContent =
              "Back to the toast.";


          }, 1100);
      }
    }




    function caught() {

      gameRunning =
        false;


      clearTimers();


      warning.classList.add(
        "hidden"
      );


  

      setDogAlert();



      setChristinaPose(
        "caught"
      );


      christina.classList.remove(
        "hidden"
      );


      christina.classList.remove(
        "entered"
      );




      requestAnimationFrame(() => {

        requestAnimationFrame(() => {

          christina.classList.add(
            "entered"
          );

        });

      });


      setAmberPose(
        "looking"
      );


      statusBubble.textContent =
        "BUSTED! Christina caught Amber.";


      playCaughtSound();


      if (
        settings.shake
      ) {

        gameArea.classList.add(
          "screen-shake"
        );


        setTimeout(() => {

          gameArea.classList.remove(
            "screen-shake"
          );

        }, 700);
      }


      finalScore.textContent =
        score;


      if (
        score > best
      ) {

        best =
          score;


        localStorage.setItem(
          "vegemiteHeistBest",
          best
        );


        bestMessage.textContent =
          "NEW PERSONAL BEST!";


        bestEl.textContent =
          best;


      } else {

        bestMessage.textContent =
          `PERSONAL BEST: ${best}`;
      }


      saveVegemiteScore(score);


 

      setTimeout(() => {

        gameOverOverlay.classList.remove(
          "hidden"
        );

      }, 1100);
    }



    function pauseGame() {

      if (
        !gameRunning ||
        paused
      ) {

        return;
      }


      paused =
        true;


      if (
        makingToast
      ) {

        clearInterval(
          toastTimer
        );


        toastTimer =
          null;


        makingToast =
          false;


        resetProgress();


        setAmberPose(
          hidden
            ? "hiding"
            : "idle"
        );
      }


      clearTimeout(
        visitTimer
      );


      visitTimer =
        null;


      if (
        warningTimer
      ) {

        clearTimeout(
          warningTimer
        );


        warningTimer =
          null;
      }


      if (
        christinaStageTimer
      ) {

        clearTimeout(
          christinaStageTimer
        );


        christinaStageTimer =
          null;
      }


      pauseOverlay.classList.remove(
        "hidden"
      );
    }


 

    function resumeGame() {

      if (!paused) {
        return;
      }


      paused =
        false;


      pauseOverlay.classList.add(
        "hidden"
      );


      if (
        dangerActive
      ) {

        

        christina.classList.add(
          "hidden"
        );


        christina.classList.remove(
          "entered"
        );


        setChristinaPose(
          "arriving"
        );


        /*
          Dog remains alert.
        */

        setDogAlert();


        warning.classList.remove(
          "hidden"
        );


        warningTitle.textContent =
          "FOOTSTEPS...";


        warningText.textContent =
          "Christina might be coming.";


        const difficulty =
          getDifficulty();


        warningTimer =
          setTimeout(

            resolveWarning,

            difficulty.warningTime
          );


      } else {

        setDogIdle();


        scheduleChristina();
      }


      toastBtn.disabled =
        hidden;
    }

    function backToMenu() {

      clearTimers();


      gameRunning =
        false;


      paused =
        false;


      dangerActive =
        false;


      hidden =
        false;


      makingToast =
        false;


      fakeWarning =
        false;


      pauseOverlay.classList.add(
        "hidden"
      );


      gameOverOverlay.classList.add(
        "hidden"
      );


      warning.classList.add(
        "hidden"
      );


      christina.classList.add(
        "hidden"
      );


      christina.classList.remove(
        "entered"
      );


      setAmberPose(
        "idle"
      );


      setChristinaPose(
        "arriving"
      );


      setDogIdle();


      menuScreen.classList.remove(
        "hidden"
      );
    }


    menuStartBtn.addEventListener(
      "click",
      startGame
    );


    restartBtn.addEventListener(
      "click",
      startGame
    );


    menuBtn.addEventListener(
      "click",
      backToMenu
    );


    quitBtn.addEventListener(
      "click",
      backToMenu
    );


    toastBtn.addEventListener(
      "click",
      makeToast
    );


    hideBtn.addEventListener(
      "click",
      hideEverything
    );


    pauseBtn.addEventListener(
      "click",
      pauseGame
    );


    resumeBtn.addEventListener(
      "click",
      resumeGame
    );


    settingsBtn.addEventListener(
      "click",
      () => {


        menuScreen.classList.add(
          "hidden"
        );


        settingsScreen.classList.remove(
          "hidden"
        );


      }
    );


    closeSettingsBtn.addEventListener(
      "click",
      () => {


        settingsScreen.classList.add(
          "hidden"
        );


        menuScreen.classList.remove(
          "hidden"
        );


      }
    );



    soundToggle.addEventListener(
      "click",
      () => {


        settings.sound =
          !settings.sound;


        saveSettings();


        updateSettingsUI();


      }
    );


    muteBtn.addEventListener(
      "click",
      () => {


        settings.sound =
          !settings.sound;


        saveSettings();


        updateSettingsUI();


      }
    );




    volumeSlider.addEventListener(
      "input",
      () => {


        settings.volume =
          Number(
            volumeSlider.value
          );


        saveSettings();


      }
    );



    shakeToggle.addEventListener(
      "click",
      () => {


        settings.shake =
          !settings.shake;


        saveSettings();


        updateSettingsUI();


      }
    );


    flashToggle.addEventListener(
      "click",
      () => {


        settings.flash =
          !settings.flash;


        saveSettings();


        updateSettingsUI();


      }
    );



    resetBestBtn.addEventListener(
      "click",
      () => {


        best =
          0;


        localStorage.removeItem(
          "vegemiteHeistBest"
        );


        bestEl.textContent =
          "0";


        resetBestBtn.textContent =
          "BEST RESET";


        setTimeout(() => {


          resetBestBtn.textContent =
            "RESET LOCAL BEST";


        }, 1200);


      }
    );


    document.addEventListener(
      "keydown",
      event => {


   

        if (
          event.code ===
          "Space"
        ) {


          event.preventDefault();


          makeToast();
        }


        /* =====================
           H = HIDE
        ===================== */

        if (
          event.key.toLowerCase() ===
          "h"
        ) {


          hideEverything();
        }


        /* =====================
           ESC = PAUSE
        ===================== */

        if (
          event.code ===
          "Escape"
        ) {


          if (
            gameRunning &&
            !paused
          ) {


            pauseGame();


          } else if (
            gameRunning &&
            paused
          ) {


            resumeGame();
          }
        }


      }
    );



    updateSettingsUI();


    setAmberPose(
      "idle"
    );


    setChristinaPose(
      "arriving"
    );


    setDogIdle();


    christina.classList.remove(
      "entered"
    );
