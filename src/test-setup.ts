import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
// Commented out problematic import
// import {
//     BrowserDynamicTestingModule,
//     platformBrowserDynamicTesting,
// } from '@angular/platform-browser-dynamic/testing';

declare const require: {
    context(path: string, deep?: boolean, filter?: RegExp): {
        <T>(id: string): T;
        keys(): string[];
    };
};

// First, initialize the Angular testing environment.
// Commented out due to import issues
/*
getTestBed().initTestEnvironment(
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting(),
);
*/

// Then we find all the tests.
const context = require.context('./', true, /\.spec\.ts$/);
// And load the modules.
context.keys().forEach(context);