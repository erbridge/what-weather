import { getForecast } from '$lib/api/forecast.server';
import { willProbablyRainHeavily } from '$lib/weather';
import type { Actions } from './$types';

interface Forecast {
	heavyRain?: boolean;
}

export const actions = {
	async default(event): Promise<
		(
			| {
					forecast: Forecast;
					success: true;
			  }
			| {
					error: string;
					success: false;
			  }
		) & {
			input: Record<string, string>;
		}
	> {
		const formData = await event.request.formData();
		const formDataEntries = Array.from(formData.entries());

		const latitude = Number(formData.get('latitude'));
		const longitude = Number(formData.get('longitude'));

		const days = Number(formData.get('days'));
		const hours = days * 24;
		const weatherConditions = formDataEntries
			.filter(([, value]) => value === 'on')
			.map(([key]) => key);

		const input = Object.fromEntries(
			formDataEntries.filter(
				(entry): entry is [string, string] =>
					[...weatherConditions, 'days'].includes(entry[0]) && !(entry[1] instanceof File)
			)
		);

		// TODO: Cache this data for eg 1 hour?
		const forecastResponse = await getForecast(
			{
				latitude,
				longitude
			},
			{
				extended: hours > 24
			}
		);

		if (!forecastResponse.success) {
			return {
				error: forecastResponse.message,
				input,
				success: false
			};
		}

		const forecast: Forecast = {};
		if (weatherConditions.includes('heavyRain')) {
			forecast.heavyRain = willProbablyRainHeavily(forecastResponse.data.hourly.data);
		}

		return {
			forecast,
			input,
			success: true
		};
	}
} satisfies Actions;
