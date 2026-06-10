import 'zone.js';
import 'zone.js/testing';

import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import { ResourceLoader } from '@angular/compiler';

class MockResourceLoader extends ResourceLoader {
  override get(url: string): Promise<string> {
    return Promise.resolve('');
  }
}

try {
  getTestBed().initTestEnvironment(
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting([
      { provide: ResourceLoader, useValue: new MockResourceLoader() }
    ])
  );
} catch {
  // Environment already initialized, ignore to prevent Vitest suite failures
}