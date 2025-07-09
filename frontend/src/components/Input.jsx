// src/components/Input.jsx

export default function Input ({ label, ...props }) {
    return (
        <div style = {{ marginBottom: 12 }}>
            {label && <label style={{ display: 'block', marginBottom: 4 }}>{label}</label>}
            <input {...props} className="input" />
        </div>
    );
}