export default function tryParseFloat(value: string): number | null {
	const parsed = parseFloat(value);
	return isNaN(parsed) ? null : parsed;
}
