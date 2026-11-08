import {
  ServiceUnavailableException,
  Injectable,
  BadGatewayException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ComputeRouteDto } from './dto/compute-route.dto.js';

interface GoogleRoutesResponse {
  routes?: Array<{
    duration?: string;
    distanceMeters?: number;
    polyline?: { encodedPolyline?: string };
    legs?: Array<{
      steps?: Array<{
        distanceMeters?: number;
        staticDuration?: string;
        navigationInstruction?: { instructions?: string };
      }>;
    }>;
  }>;
}

@Injectable()
export class NavigationService {
  constructor(private readonly config: ConfigService) {}

  async computeRoute(dto: ComputeRouteDto) {
    const apiKey = this.config.get<string>('googleMapsApiKey');
    if (!apiKey) {
      throw new ServiceUnavailableException(
        'Route navigation is not configured on this server',
      );
    }

    const response = await fetch(
      'https://routes.googleapis.com/directions/v2:computeRoutes',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask':
            'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.legs.steps.distanceMeters,routes.legs.steps.staticDuration,routes.legs.steps.navigationInstruction.instructions',
        },
        body: JSON.stringify({
          origin: {
            location: {
              latLng: {
                latitude: dto.originLatitude,
                longitude: dto.originLongitude,
              },
            },
          },
          destination: {
            location: {
              latLng: {
                latitude: dto.destinationLatitude,
                longitude: dto.destinationLongitude,
              },
            },
          },
          travelMode: dto.travelMode,
        }),
        signal: AbortSignal.timeout(10000),
      },
    );

    if (!response.ok) {
      throw new BadGatewayException(
        'The route provider could not calculate this route',
      );
    }

    const data = (await response.json()) as GoogleRoutesResponse;
    const route = data.routes?.[0];
    if (
      !route?.polyline?.encodedPolyline ||
      !route.distanceMeters ||
      !route.duration
    ) {
      throw new BadGatewayException(
        'The route provider returned no usable route',
      );
    }
    const durationSeconds = Number.parseFloat(route.duration);
    if (!Number.isFinite(durationSeconds)) {
      throw new BadGatewayException(
        'The route provider returned an invalid duration',
      );
    }

    return {
      encodedPolyline: route.polyline.encodedPolyline,
      distanceMeters: route.distanceMeters,
      durationSeconds,
      steps: (route.legs ?? []).flatMap((leg) =>
        (leg.steps ?? []).map((step) => ({
          instruction:
            step.navigationInstruction?.instructions ?? 'Continue on the route',
          distanceMeters: step.distanceMeters ?? 0,
          durationSeconds: Number.parseFloat(step.staticDuration ?? '0s') || 0,
        })),
      ),
    };
  }
}
