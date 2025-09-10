import React, { useEffect, useState } from "react";
import { API_URL } from "../Api/api";

const FormComboBox = ({
name,
value,
onChange,
placeholder = "Seleccione una opción",
required,
}) => {
const [options, setOptions] = useState([]);

useEffect(() => {
fetch(`${API_URL}zonas/`)
    .then((res) => res.json())
    .then((data) =>
    setOptions(
        data.map((z) => ({
        value: z.id,
        label: z.nombre,
        }))
    )
    )
    .catch((err) => console.error("Error cargando zonas:", err));
}, []);

return (
<select
    className="full-width"
    name={name}
    value={value}
    onChange={onChange}
    required={required}
>
    <option value="">{placeholder}</option>
    {options.map((opt) => (
    <option key={opt.value} value={opt.value}>
        {opt.label}
    </option>
    ))}
</select>
);
};

export default FormComboBox;
