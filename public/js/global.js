'use strict';

import { Pattern } from './plugins/pattern.min.js';
import { home } from './home.js';
import { wardrobe } from './wardrobe.js';

/* Global vars */

var touchScreen;
var patrn;

/* On DOM load */

document.addEventListener('DOMContentLoaded', () => {
  touchScreen = matchMedia('(hover: none)').matches; // Detect mobile
  setEvents(); // Mouse and keyboard

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

function setEvents() {}

/* Start/Router */

function start() {
  patrn = new Pattern();
  patrn.init(patternChange);
}

function patternChange() {
  loadSection(patrn.page);
}

function loadSection(section) {
  // Hide all sections
  const sections = document.querySelectorAll('section');

  for (let x = 0; x < sections.length; x++) {
    sections[x].style.display = '';
  }

  document.querySelector('section#section-' + section).style.display = 'flex'; // Show section

  switch (section) {
    case 'wardrobe':
      wardrobe();
      break;
    default:
      home();
  }
}

/* Global */