import React, { useEffect, useState } from "react";

const FormComboBox = ({
name,
value,
onChange,
placeholder = "Seleccione una opción",
required,
}) => {
const [options, setOptions] = useState([]);

useEffect(() => {
fetch("http://127.0.0.1:8000/zonas/")
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
