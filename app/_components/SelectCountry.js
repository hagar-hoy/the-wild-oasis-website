import { getCountries } from "@/app/_lib/data-service";

async function SelectCountry({ defaultCountry, name, id, className }) {
  const countries = await getCountries();

  const flag =
    countries.find((country) => country.names.common === defaultCountry)?.flag
      ?.url_png ?? "";

  return (
    <select
      name={name}
      id={id}
      // Encode BOTH the country name and the flag into the value,
      // then split them again in the server action
      defaultValue={`${defaultCountry}%${flag}`}
      className={className}
    >
      <option value="">Select country...</option>
      {countries.map((c) => (
        <option
          key={c.names.common}
          value={`${c.names.common}%${c.flag.url_png}`}
        >
          {c.names.common}
        </option>
      ))}
    </select>
  );
}

export default SelectCountry;
