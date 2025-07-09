// src/components/Alert.jsx

export default function Alert({ type = 'info', children }){
    const color = type === 'error' ? '#d32f2f' : type === 'success' ? '#388e3c' : '#1976d2';
    const bg = type === 'error' ? '#ffebee' : type === 'success' ? '#e8f5e9' : '#e3f2fd';
    return (
        <div style={{
            background: bg,
            color,
            padding: '10px 16px',
            borderRadius: 6,
            margin: '8px 0',
            fontWeight: 500
        }}>
            {children}
        </div>
    );
}