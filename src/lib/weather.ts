import type { ForecastDataPoint } from './api/forecast.server';

export function willProbablyRainHeavily(forecastHourlyData: ForecastDataPoint[]) {
	return forecastHourlyData.some(
		({ precipIntensity, precipIntensityError, precipProbability, precipType }) =>
			precipType !== 'none' &&
			precipProbability > 0.5 &&
			precipIntensity + 2 * precipIntensityError > 2
	);
}
