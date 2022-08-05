'use strict';

//import { Module } from './XXXXX.js';

/* Global vars */

window.touchScreen;

/* On DOM load */

document.addEventListener('DOMContentLoaded', () => {
    window.touchScreen = matchMedia('(hover: none)').matches; // Detect mobile
    setEventsGlobal(); // Mouse and keyboard

    // Scroll
    window.addEventListener('scroll', () => {
        //window.pageYOffset;
    });

    // Resize
    window.addEventListener('resize', () => {

    });

    document.querySelector('html').style.visibility = 'visible'; // Hack to avoid FOUC
    start();
});

/* Mouse and keyboard events */

function setEventsGlobal() {}

/* Start */

function start() {}

/* Global */