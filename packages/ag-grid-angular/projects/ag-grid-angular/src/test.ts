// This file is required by karma.conf.js and loads recursively all the .spec and framework files
import { NgModule, provideZoneChangeDetection } from '@angular/core';
import { getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

// The specs assert zone behaviour; TestBed is zoneless by default.
@NgModule({ providers: [provideZoneChangeDetection()] })
class ZoneChangeDetectionTestingModule {}

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
    [BrowserDynamicTestingModule, ZoneChangeDetectionTestingModule],
    platformBrowserDynamicTesting(),
    {
        teardown: { destroyAfterEach: true },
    }
);
