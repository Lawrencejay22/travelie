import { ServiceUnavailableException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfigService } from '@nestjs/config';
import { NavigationService } from './navigation.service.js';

describe('NavigationService', () => {
  const getConfig = vi.fn();
  const config = { get: getConfig } as unknown as ConfigService;
  const service = new NavigationService(config);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it('requires an explicitly configured Routes API key', async () => {
    getConfig.mockReturnValue(undefined);

    await expect(
      service.computeRoute({
        originLatitude: 14.5,
        originLongitude: 121,
        destinationLatitude: 14.6,
        destinationLongitude: 121.1,
        travelMode: 'WALK',
      }),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('returns the encoded line, distance, duration, and directions from the provider', async () => {
    getConfig.mockReturnValue('server-only-key');
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          routes: [
            {
              distanceMeters: 1200,
              duration: '300s',
              polyline: { encodedPolyline: 'abc' },
              legs: [
                {
                  steps: [
                    {
                      distanceMeters: 1200,
                      staticDuration: '300s',
                      navigationInstruction: { instructions: 'Head north' },
                    },
                  ],
                },
              ],
            },
          ],
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(
      service.computeRoute({
        originLatitude: 14.5,
        originLongitude: 121,
        destinationLatitude: 14.6,
        destinationLongitude: 121.1,
        travelMode: 'WALK',
      }),
    ).resolves.toEqual({
      encodedPolyline: 'abc',
      distanceMeters: 1200,
      durationSeconds: 300,
      steps: [{ instruction: 'Head north', distanceMeters: 1200, durationSeconds: 300 }],
    });
  });
});
