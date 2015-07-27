#Ionic Scroll Sista
>An Ionic plugin that will hide your header and tabs while scrolling a list to give users a little more room.  This plugin was inspired by [Ionic Header Shrink](https://github.com/driftyco/ionic-ion-header-shrink) however it doesn't seem that the repo is still maintained, not to mention it doesn't support the breaking changes from Ionic beta-14.

## Table of Contents
 - [Demo](#demo)
 - [Setup](#setup)
 - [Usage](#usage)

## Demo

- Watch the Demo video below

[![Ionic Scroll Sista](http://img.youtube.com/vi/_GCDup3X5vg/0.jpg)](http://www.youtube.com/watch?v=_GCDup3X5vg)

- [View Demo](http://makeagif.com/i/EZ-klS)
- Download from [Ionic View](http://view.ionic.io/) with appId: `474d3495`


View the demo application code at demo/ for an example on how to use the filterBar.  To run the demo
clone the ionic-scroll-sista repo, then navigate to the demo/ directory and run the following

    npm install
    bower install
    gulp
    
## Setup

#### Install

`bower install ionic-scroll-sista`

#### JS Import (index.html)
Include the following JavaScript file import in your index.html.  Remember to import the ionic libraries first!
The example below assumes your 3rd party bower dependencies are located in the default bower_components folder.

    <script src="bower_components/ionic-scroll-sista/dist/ionic.scroll.sista.js"></script>

#### Angular Dependency (app.js)
Add `jett.ionic.scroll.sista` as a module dependency of your app module.

    angular.module('Demo', ['ionic', 'jett.ionic.scroll.sista'])
      .config(function () {..});

## Usage

Ionic Scroll Sista is an attribute level directive that you put in your ion-content.  By default, Ionic Scroll Sista
will only push both header while scrolling, however you can also push your tabs (both top/bottom supported) by
supplying the value `header-and-tabs`.

Ionic Scroll Sista includes the following behavior
  - Only JS scrolling currently supported (havent yet tested native scrolling) 
  - The header/tabs will hide while dragging/scrolling up, and show while dragging/scrolling down.
  - The header/tabs will show when you get to the bottom of the scroll view
  - iOS header/title/buttons will fade AND scale down like Instagram
  - Android header/title/buttons will fade only
  - If `header-and-tabs` is defined, top tabs will slide underneath header first, then slide up just like Facebook
  - If `header-and-tabs` is NOT defined, top tabs will slide up with header but stick at the top.
  - tabs/header are reset on pull to refresh or when the active view leaves
  - Currently sub-headers are not supported  :-(

NOTE: If you have more than one scrolling area, define the `scroll-delegate` attribute on `ion-content` so that Scroll
Sista picks uses the correct scroll delegate

      //header only
      <ion-content scroll-sista>
        //your list and content
      </ion-content>

      //header and tabs
      <ion-content scroll-sista="header-and-tabs">
        //your list and content
      </ion-content>


