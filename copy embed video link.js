// ==UserScript==
// @name         Copy Course and Video URLs updated
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Copy current course URL and video URL to clipboard
// @author       You
// @match        https://dashboard.codein.com/learn/courses/*
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  function createOverlayButton() {
    var overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.bottom = "20px";
    overlay.style.left = "20px";
    overlay.style.zIndex = "1000";
    overlay.style.cursor = "move";

    var button = document.createElement("button");
    button.style.padding = "10px";
    button.style.fontSize = "20px";
    button.style.borderRadius = "50%";
    button.style.width = "50px";
    button.style.height = "50px";
    button.innerHTML = "&#128190;";

    var notification = document.createElement("div");
    notification.style.display = "none";
    notification.style.position = "fixed"; // Ubah dari absolute ke fixed
    notification.style.backgroundColor = "#4CAF50";
    notification.style.color = "white";
    notification.style.padding = "5px 10px";
    notification.style.borderRadius = "5px";
    notification.style.fontSize = "14px";
    notification.style.zIndex = "1001"; // Pastikan lebih tinggi dari overlay

    function updateNotificationPosition() {
      // Posisikan notifikasi relatif terhadap posisi tombol
      var overlayRect = overlay.getBoundingClientRect();
      notification.style.left = overlayRect.left + 60 + "px"; // Di sebelah kanan tombol
      notification.style.top = overlayRect.top + 10 + "px"; // Sejajar dengan tombol
    }

    function showNotification(message) {
      notification.textContent = message;
      updateNotificationPosition(); // Update posisi sebelum menampilkan
      notification.style.display = "block";
      setTimeout(function () {
        notification.style.display = "none";
      }, 3000);
    }

    // Flag untuk menandai jika sedang drag
    var isDragging = false;

    button.onclick = function (event) {
      // Hanya jalankan jika tidak sedang dragging
      if (!isDragging) {
        var videoIframe = document.querySelector(
          'iframe[src^="https://iframe.mediadelivery.net/embed/"]'
        );
        if (videoIframe) {
          var videoUrl = videoIframe.src.replace(
            /\?autoplay=false&preload=true$/,
            ""
          );
          var titleElement = document.querySelector("h1.section-title");
          var title = titleElement ? titleElement.textContent.trim() : "";
          var textToCopy =
            JSON.stringify(
              {
                referer: window.location.href,
                embed_url: videoUrl,
                name: title,
              },
              null,
              4
            ) + ",";

          navigator.clipboard.writeText(textToCopy).then(
            function () {
              console.log("URLs copied to clipboard");
              showNotification("URLs successfully copied!");
            },
            function (err) {
              console.error("Could not copy URLs: ", err);
            }
          );
        }
      }
    };

    overlay.onmousedown = function (event) {
      // Jangan trigger drag jika klik pada button
      if (event.target === button) {
        return;
      }

      isDragging = false; // Reset flag di awal mousedown
      var startX = event.clientX - overlay.getBoundingClientRect().left;
      var startY = event.clientY - overlay.getBoundingClientRect().top;

      function moveAt(pageX, pageY) {
        isDragging = true; // Set flag saat mulai drag

        var newX = pageX - startX;
        var newY = pageY - startY;

        var rightEdge = window.innerWidth - overlay.offsetWidth;
        var bottomEdge = window.innerHeight - overlay.offsetHeight;

        if (newX < 0) newX = 0;
        if (newX > rightEdge) newX = rightEdge;
        if (newY < 0) newY = 0;
        if (newY > bottomEdge) newY = bottomEdge;

        overlay.style.left = newX + "px";
        overlay.style.top = newY + "px";
        overlay.style.bottom = "auto"; // Hilangkan bottom untuk menghindari konflik

        updateNotificationPosition(); // Update posisi notifikasi saat drag
      }

      function onMouseMove(event) {
        moveAt(event.pageX, event.pageY);
      }

      document.addEventListener("mousemove", onMouseMove);

      document.onmouseup = function () {
        document.removeEventListener("mousemove", onMouseMove);
        document.onmouseup = null;

        // Pertahankan flag drag untuk sesaat untuk mencegah onclick trigger
        setTimeout(function () {
          isDragging = false;
        }, 100);
      };
    };

    overlay.ondragstart = function () {
      return false;
    };

    overlay.appendChild(button);
    document.body.appendChild(overlay);
    document.body.appendChild(notification); // Pindahkan notifikasi ke body
  }

  createOverlayButton();
})();
