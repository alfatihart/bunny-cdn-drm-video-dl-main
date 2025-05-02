// ==UserScript==
// @name         Copy Course and Video URLs5
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Copy current course URL and video URL to clipboard
// @author       You
// @match        https://dashboard.codepolitan.com/learn/courses/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function createOverlayButton() {
        var overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.bottom = '20px';
        overlay.style.left = '20px';
        overlay.style.zIndex = '1000';
        overlay.style.cursor = 'move';

        var button = document.createElement('button');
        button.style.padding = '10px';
        button.style.fontSize = '20px';
        button.style.borderRadius = '50%';
        button.style.width = '50px';
        button.style.height = '50px';
        button.innerHTML = '&#128190;';
        button.onclick = function() {
            var videoIframe = document.querySelector('iframe[src^="https://iframe.mediadelivery.net/embed/"]');
            if (videoIframe) {
                var videoUrl = videoIframe.src.replace(/\?autoplay=false&preload=true$/, '');
                var textToCopy = JSON.stringify({
                    'referer': window.location.href,
                    'embed_url': videoUrl,
                    'name': ""
                }, null, 4) + ',';

                navigator.clipboard.writeText(textToCopy).then(function() {
                    console.log('URLs copied to clipboard');
                    showNotification('URLs successfully copied!');
                }, function(err) {
                    console.error('Could not copy URLs: ', err);
                });
            }
        };

        var notification = document.createElement('div');
        notification.style.display = 'none';
        notification.style.position = 'absolute';
        notification.style.bottom = '60px';
        notification.style.left = '0';
        notification.style.backgroundColor = '#4CAF50';
        notification.style.color = 'white';
        notification.style.padding = '5px 10px';
        notification.style.borderRadius = '5px';
        notification.style.fontSize = '14px';

        function showNotification(message) {
            notification.textContent = message;
            notification.style.display = 'block';
            setTimeout(function() {
                notification.style.display = 'none';
            }, 3000);
        }

        overlay.onmousedown = function(event) {
            var startX = event.clientX - overlay.getBoundingClientRect().left;
            var startY = event.clientY - overlay.getBoundingClientRect().top;

            function moveAt(pageX, pageY) {
                var newX = pageX - startX;
                var newY = pageY - startY;

                var rightEdge = window.innerWidth - overlay.offsetWidth;
                var bottomEdge = window.innerHeight - overlay.offsetHeight;

                if (newX < 0) newX = 0;
                if (newX > rightEdge) newX = rightEdge;
                if (newY < 0) newY = 0;
                if (newY > bottomEdge) newY = bottomEdge;

                overlay.style.left = newX + 'px';
                overlay.style.top = newY + 'px';
            }

            function onMouseMove(event) {
                moveAt(event.pageX, event.pageY);
            }

            document.addEventListener('mousemove', onMouseMove);

            overlay.onmouseup = function() {
                document.removeEventListener('mousemove', onMouseMove);
                overlay.onmouseup = null;
            };
        };

        overlay.ondragstart = function() {
            return false;
        };

        overlay.appendChild(button);
        overlay.appendChild(notification);
        document.body.appendChild(overlay);
    }

    createOverlayButton();
})();
