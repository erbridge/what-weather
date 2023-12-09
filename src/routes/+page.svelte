<script lang="ts">
	import type { ActionData } from './$types';

	export let form: ActionData;

	let coords: GeolocationCoordinates | undefined;
	let positionError: GeolocationPositionError | undefined;

	if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
		navigator.geolocation.getCurrentPosition(
			(position) => {
				coords = position.coords;
			},
			(err) => {
				positionError = err;
			},
			{
				enableHighAccuracy: true
			}
		);
	}
</script>

<h1>What’s the weather like?</h1>

<form method="POST">
	<p>
		Will there be

		<label
			><input type="checkbox" name="heavyRain" checked={form?.input.heavyRain === 'on'} /> heavy rain</label
		>
		<label><input type="checkbox" name="fog" checked={form?.input.fog === 'on'} /> fog</label>
		<label><input type="checkbox" name="ice" checked={form?.input.ice === 'on'} /> ice</label>
		<label><input type="checkbox" name="snow" checked={form?.input.snow === 'on'} /> snow</label>
		<label
			><input type="checkbox" name="lightning" checked={form?.input.lightning === 'on'} /> lightning</label
		>

		over the next

		<input type="number" name="days" min={1} max={7} value={form?.input.days ?? 1} />

		days?
	</p>

	{#if coords}
		<input type="hidden" name="latitude" value={coords.latitude} />
		<input type="hidden" name="longitude" value={coords.longitude} />
		<input type="submit" value="So? Will there?" />
	{:else if positionError}
		<input type="submit" value="So? Will there?" disabled />
		<p>Issue fetching your location</p>
		<pre>{positionError.code}: {positionError.message}</pre>
	{:else}
		<input type="submit" value="Finding location..." disabled />
	{/if}

	{#if form}
		{#if form.forecast.success}
			<p>Success!</p>
			<pre>{JSON.stringify(form.forecast.data, null, 2)}</pre>
		{:else}
			<p>Oops! {form.forecast.message}</p>
		{/if}
	{/if}
</form>
