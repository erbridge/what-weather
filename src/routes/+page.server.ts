import { getForecast } from '$lib/api/forecast.server';
import type { Actions } from './$types';

export const actions = {
	async default(event) {
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
		const forecast = await getForecast(
			{
				latitude,
				longitude
			},
			{
				extended: hours > 24
			}
		);

		return {
			forecast,
			input
		};
	}
} satisfies Actions;
