import { env } from '$env/dynamic/private';

export interface SpaceTime {
	latitude: number;
	longitude: number;
	time?: Date;
}

// http://pirateweather.net/en/latest/API/#data-point
export interface ForecastDataPoint {
	apparentTemperature: number;
	cloudCover: number;
	dewPoint: number;
	humidity: number;
	icon:
		| 'clear-day'
		| 'clear-night'
		| 'rain'
		| 'snow'
		| 'sleet'
		| 'wind'
		| 'fog'
		| 'cloudy'
		| 'partly-cloudy-day'
		| 'partly-cloudy-night';
	ozone: number;
	precipAccumulation: number;
	precipIntensity: number;
	precipIntensityError: number;
	precipProbability: number;
	precipType: 'rain' | 'snow' | 'sleet' | 'none';
	pressure: number;
	summary: string;
	temperature: number;
	time: number;
	uvIndex: number;
	visibility: number;
	windBearing: number;
	windGust: number;
	windSpeed: number;
}

export interface Forecast {
	latitude: number;
	longitude: number;
	timezone: string;
	offset: number;
	elevation: number;
	hourly: {
		summary: string;
		icon: string;
		data: ForecastDataPoint[];
	};
	flags: {
		sources: string[];
		sourceTimes: Record<string, string>;
		'nearest-station': number;
		units: 'si';
		version: string;
	};
}

export type ForecastResponse =
	| {
			success: true;
			data: Forecast;
	  }
	| {
			success: false;
			message: string;
	  };

export interface GetForecastOptions {
	extended?: boolean;
}

export async function getForecast(
	spaceTime: SpaceTime,
	{ extended = false }: GetForecastOptions
): Promise<ForecastResponse> {
	const response = await fetch(makeForecastUrl(spaceTime, extended));
	const data = await response.json();

	if (response.ok) {
		return {
			success: true,
			data: data as Forecast
		};
	}

	return {
		success: false,
		message: data.message
	};
}

function makeForecastUrl(spaceTime: SpaceTime, extended: boolean): URL {
	let endpoint = `/forecast/${env.PIRATE_WEATHER_API_KEY}/${spaceTime.latitude},${spaceTime.longitude}`;
	if (spaceTime.time) {
		endpoint += `,${spaceTime.time.toISOString()}`;
	}

	const base =
		env.NODE_ENV === 'development'
			? 'https://dev.pirateweather.net'
			: 'https://api.pirateweather.net';

	const url = new URL(endpoint, base);
	url.searchParams.append('exclude', ['currently', 'minutely', 'daily'].join(','));
	url.searchParams.append('units', 'si');
	if (extended) {
		url.searchParams.append('extend', 'hourly');
	}

	return url;
}
