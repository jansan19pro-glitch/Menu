import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

// --- TYPE DEFINITIONS ---
interface Dish {
    name: string;
    ingredients: string[];
    allergens: string[];
}

interface Authorization {
    foodName: string;
    date: string;
    parentName: string;
    signatureDataUrl: string;
}

interface Student {
    firstName: string;
    lastName: string;
    classId: string;
    authorizedFoods: Record<string, string>;
    authorizations: Authorization[];
}

interface DayDishes {
    dish1?: string;
    dish2?: string;
    dessert?: string;
}

type DaysOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';

interface Menu {
    name: string;
    days: Record<DaysOfWeek, DayDishes>;
}

// Data collections
type Dishes = Record<string, Dish>;
type Students = Record<string, Student>;
type Menus = Record<string, Menu>;

// --- DATOS DE EJEMPLO (MOCK DATA) ---
const initialDishes: Dishes = {
    "dish_1": { name: "Puré de Pollo y Verduras", ingredients: ["Pollo", "Patata", "Zanahoria"], allergens: [] },
    "dish_2": { name: "Fruta triturada", ingredients: ["Manzana", "Pera", "Plátano"], allergens: [] },
    "dish_3": { name: "Lentejas bebé", ingredients: ["Lenteja", "Zanahoria", "Patata"], allergens: [] },
    "dish_4": { name: "Pescado blanco hervido", ingredients: ["Merluza", "Patata"], allergens: [] },
    "dish_5": { name: "Yogur natural", ingredients: ["Leche"], allergens: ["Lácteos"] },
};

const initialStudents: Students = {
    "student_1": { firstName: "Sofía", lastName: "García", classId: "Clase A", authorizedFoods: { "Pollo": "2024-05-10T09:15:00Z", "Patata": "2024-05-10T09:15:00Z", "Manzana": "2024-05-11T10:00:00Z", "Pera": "2024-05-11T10:00:00Z" }, authorizations: [] },
    "student_2": { firstName: "Lucas", lastName: "Martínez", classId: "Clase A", authorizedFoods: { "Pollo": "2024-05-12T09:00:00Z", "Patata": "2024-05-12T09:00:00Z", "Zanahoria": "2024-05-12T09:00:00Z", "Manzana": "2024-05-13T11:20:00Z", "Pera": "2024-05-13T11:20:00Z", "Plátano": "2024-05-13T11:20:00Z", "Lenteja": "2024-05-14T09:30:00Z", "Merluza": "2024-05-15T16:00:00Z", "Leche": "2024-05-16T08:45:00Z" }, authorizations: [] },
    "student_3": { firstName: "Martina", lastName: "Rodríguez", classId: "Clase B", authorizedFoods: { "Pollo": "2024-05-10T09:15:00Z", "Patata": "2024-05-10T09:15:00Z" }, authorizations: [] },
    "student_4": { firstName: "Hugo", lastName: "Sánchez", classId: "Clase A", authorizedFoods: { "Pollo": "2024-05-11T12:00:00Z", "Patata": "2024-05-11T12:00:00Z", "Zanahoria": "2024-05-12T13:00:00Z" }, authorizations: [] },
};

const initialMenus: Menus = {
    "menu_1": {
        name: "Menú Semana 1",
        days: {
            monday: { dish1: "dish_1", dish2: "dish_2", dessert: "dish_5" },
            tuesday: { dish1: "dish_3", dish2: "dish_4", dessert: "dish_2" },
            wednesday: { dish1: "dish_1", dish2: "dish_2", dessert: "dish_5" },
            thursday: { dish1: "dish_3", dish2: "dish_4", dessert: "dish_2" },
            friday: { dish1: "dish_1", dish2: "dish_2", dessert: "dish_5" },
        }
    }
};

const capitalize = (s: string) => s && s.charAt(0).toUpperCase() + s.slice(1);
const dayNames: Record<DaysOfWeek, string> = { monday: 'Lunes', tuesday: 'Martes', wednesday: 'Miércoles', thursday: 'Jueves', friday: 'Viernes' };
const logoDataUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAoAAAAGQCAYAAAAeT/y7AAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAJcEhZcwAAFiUAABYlAUlSJPAAAAAhdEVYdENyZWF0aW9uIFRpbWUAMjAyNC0wOC0wOFQwMDoxMDoxNyswMDowMDb7u7YAAAXeSURBVHic7cExAQAAAMKg9U/tbwagAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAB3jAAAEA/1P5AAAAAElFTkSuQmCC";

// --- ESTILOS (CSS-in-JS) ---
const styles: { [key: string]: React.CSSProperties } = {
    header: { textAlign: 'center', marginBottom: '2rem' },
    logo: { maxWidth: '350px', height: 'auto', marginBottom: '1rem' },
    title: { fontSize: '2.5rem', color: 'var(--primary-dark)', fontWeight: '700' },
    nav: { display: 'flex', justifyContent: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '0.5rem' },
    navButton: { padding: '0.75rem 1.5rem', border: 'none', borderRadius: 'var(--border-radius)', backgroundColor: 'var(--white)', color: 'var(--primary-dark)', cursor: 'pointer', fontWeight: '500', fontSize: '1rem', transition: 'all 0.2s ease-in-out', boxShadow: 'var(--box-shadow)' },
    navButtonActive: { backgroundColor: 'var(--primary-color)', color: 'var(--white)', transform: 'translateY(-2px)' },
    card: { backgroundColor: 'var(--white)', borderRadius: 'var(--border-radius)', boxShadow: 'var(--box-shadow)', padding: '1.5rem', marginBottom: '1rem' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' },
    h2: { color: 'var(--primary-dark)', borderBottom: '2px solid var(--primary-light)', paddingBottom: '0.5rem', marginBottom: '1rem' },
    form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
    input: { padding: '0.75rem', border: '1px solid var(--divider-color)', borderRadius: 'var(--border-radius)', fontSize: '1rem' },
    button: { padding: '0.75rem 1.5rem', border: 'none', borderRadius: 'var(--border-radius)', backgroundColor: 'var(--primary-color)', color: 'var(--white)', cursor: 'pointer', fontWeight: '500', fontSize: '1rem', transition: 'background-color 0.2s', alignSelf: 'flex-start' },
    buttonSecondary: { backgroundColor: 'var(--divider-color)', color: 'var(--text-primary)' },
    buttonDanger: { backgroundColor: 'var(--danger-color)' },
    cardActions: { display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem', borderTop: '1px solid var(--background-color)', paddingTop: '1rem' },
    select: { padding: '0.75rem', border: '1px solid var(--divider-color)', borderRadius: 'var(--border-radius)', fontSize: '1rem', backgroundColor: 'var(--white)' },
    alertCard: { borderLeft: '5px solid var(--danger-color)', backgroundColor: 'var(--danger-light)', padding: '1rem', marginBottom: '1rem', borderRadius: '0 var(--border-radius) var(--border-radius) 0' },
    alertStudentName: { fontWeight: 'bold', color: 'var(--danger-color)' },
    dayColumn: { flex: '1 1 250px', minWidth: '250px' },
    reportContainer: { display: 'flex', flexWrap: 'wrap', gap: '1rem' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { backgroundColor: 'var(--white)', padding: '2rem', borderRadius: 'var(--border-radius)', boxShadow: '0 5px 15px rgba(0,0,0,0.3)', width: '90%', maxWidth: '500px', position: 'relative' },
    modalCloseButton: { position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-secondary)' },
    signatureCanvas: { border: '1px solid var(--divider-color)', borderRadius: 'var(--border-radius)', cursor: 'crosshair', touchAction: 'none' },
};

// --- COMPONENTES GENÉRICOS ---
const Modal: React.FC<{ onClose: () => void, children: React.ReactNode }> = ({ children, onClose }) => (
    <div style={styles.modalOverlay}>
        <div style={styles.modalContent}>
            <button style={styles.modalCloseButton} onClick={onClose} aria-label="Cerrar modal">&times;</button>
            {children}
        </div>
    </div>
);


// --- COMPONENTES DE LA APLICACIÓN ---
interface AlertReportProps { students: Students; menus: Menus; dishes: Dishes; }
interface DailyAlert { studentName: string; missingIngredients: string[]; }
interface DailyAlerts { [day: string]: DailyAlert[]; }

const AlertReport = ({ students, menus, dishes }: AlertReportProps) => {
    const [selectedMenuId, setSelectedMenuId] = useState(Object.keys(menus)[0] || '');
    const [selectedClassId, setSelectedClassId] = useState('Clase A');
    const classes = useMemo(() => [...new Set(Object.values(students).map(s => s.classId))], [students]);

    const report = useMemo((): DailyAlerts | null => {
        if (!selectedMenuId || !selectedClassId) return null;
        const menu = menus[selectedMenuId];
        const relevantStudents = Object.values(students).filter(s => s.classId === selectedClassId);
        const dailyAlerts: DailyAlerts = {};
        for (const day in menu.days) {
            const dayKey = day as DaysOfWeek;
            dailyAlerts[dayKey] = [];
            const dayDishIds = Object.values(menu.days[dayKey]).filter((id): id is string => !!id);
            const dayIngredients = new Set<string>();
            dayDishIds.forEach(dishId => {
                dishes[dishId]?.ingredients.forEach(ing => dayIngredients.add(ing));
            });
            relevantStudents.forEach(student => {
                const authorized = Object.keys(student.authorizedFoods);
                const missingIngredients = [...dayIngredients].filter(ing => !authorized.includes(ing));
                if (missingIngredients.length > 0) {
                    dailyAlerts[dayKey].push({ studentName: `${student.firstName} ${student.lastName}`, missingIngredients });
                }
            });
        }
        return dailyAlerts;
    }, [selectedMenuId, selectedClassId, students, menus, dishes]);

    return (
        <div style={styles.card}>
            <h2 style={styles.h2}>Informe de Alertas de Seguridad Alimentaria</h2>
            <div style={{ ...styles.form, flexDirection: 'row', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <select style={styles.select} value={selectedMenuId} onChange={e => setSelectedMenuId(e.target.value)}>
                    {Object.entries(menus).map(([id, menu]) => <option key={id} value={id}>{menu.name}</option>)}
                </select>
                <select style={styles.select} value={selectedClassId} onChange={e => setSelectedClassId(e.target.value)}>
                    {classes.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
            <div style={styles.reportContainer}>
                {report && Object.entries(report).map(([day, alerts]) => (
                    <div key={day} style={styles.dayColumn}>
                        <h3 style={{ ...styles.h2, fontSize: '1.2rem' }}>{dayNames[day as DaysOfWeek]}</h3>
                        {alerts.length === 0 ? (<p style={{ color: 'var(--text-secondary)' }}>✅ Todos los alumnos pueden comer el menú.</p>) : (
                            alerts.map((alert, index) => (
                                <div key={index} style={styles.alertCard}>
                                    <p style={styles.alertStudentName}>{alert.studentName}</p>
                                    <p>Falta autorizar: <strong>{alert.missingIngredients.join(', ')}</strong></p>
                                </div>
                            ))
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

interface DishManagerProps { dishes: Dishes; setDishes: React.Dispatch<React.SetStateAction<Dishes>>; }
const DishManager = ({ dishes, setDishes }: DishManagerProps) => {
    const [name, setName] = useState('');
    const [ingredients, setIngredients] = useState('');
    const [editingDish, setEditingDish] = useState<[string, Dish] | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !ingredients) return;
        const newDish: Dish = { name, ingredients: ingredients.split(',').map(i => i.trim()), allergens: [] };
        const newId = `dish_${Date.now()}`;
        setDishes(prev => ({ ...prev, [newId]: newDish }));
        setName('');
        setIngredients('');
    };

    const handleDelete = (dishId: string) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este plato?')) {
            setDishes(prev => {
                const next = { ...prev };
                delete next[dishId];
                return next;
            });
        }
    };
    
    const handleSaveEdit = (dishId: string, updatedDish: Dish) => {
        setDishes(prev => ({ ...prev, [dishId]: updatedDish }));
        setEditingDish(null);
    };

    const EditDishForm: React.FC<{ dish: Dish, dishId: string, onSave: (id: string, dish: Dish) => void }> = ({ dish, dishId, onSave }) => {
        const [currentName, setCurrentName] = useState(dish.name);
        const [currentIngredients, setCurrentIngredients] = useState(dish.ingredients.join(', '));
        
        const handleFormSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            onSave(dishId, { ...dish, name: currentName, ingredients: currentIngredients.split(',').map(i => i.trim()) });
        };

        return (
            <form onSubmit={handleFormSubmit} style={styles.form}>
                <h3 style={styles.h2}>Editar Plato</h3>
                <input style={styles.input} type="text" value={currentName} onChange={e => setCurrentName(e.target.value)} />
                <input style={styles.input} type="text" value={currentIngredients} onChange={e => setCurrentIngredients(e.target.value)} />
                <button style={styles.button} type="submit">Guardar Cambios</button>
            </form>
        )
    };

    return (
        <>
            <div style={styles.card}>
                <h2 style={styles.h2}>Añadir Nuevo Plato</h2>
                <form onSubmit={handleSubmit} style={styles.form}>
                    <input style={styles.input} type="text" placeholder="Nombre del plato" value={name} onChange={e => setName(e.target.value)} />
                    <input style={styles.input} type="text" placeholder="Ingredientes (separados por comas)" value={ingredients} onChange={e => setIngredients(e.target.value)} />
                    <button style={styles.button} type="submit">Añadir Plato</button>
                </form>
            </div>
            <div style={styles.grid}>
                {Object.entries(dishes).map(([id, dish]) => (
                    <div key={id} style={styles.card}>
                        <h3>{dish.name}</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>{dish.ingredients.join(', ')}</p>
                        <div style={styles.cardActions}>
                            <button style={{...styles.button, ...styles.buttonSecondary}} onClick={() => setEditingDish([id, dish])}>Editar</button>
                            <button style={{...styles.button, ...styles.buttonDanger}} onClick={() => handleDelete(id)}>Eliminar</button>
                        </div>
                    </div>
                ))}
            </div>
            {editingDish && (
                <Modal onClose={() => setEditingDish(null)}>
                    <EditDishForm dish={editingDish[1]} dishId={editingDish[0]} onSave={handleSaveEdit} />
                </Modal>
            )}
        </>
    );
};

interface SignaturePadProps {
    foodName: string;
    onClose: () => void;
    onSave: (auth: Omit<Authorization, 'foodName' | 'date'>) => void;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ foodName, onClose, onSave }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [parentName, setParentName] = useState('');
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasDrawn, setHasDrawn] = useState(false);

    const getPosition = (e: MouseEvent | TouchEvent) => {
        if (!canvasRef.current) return { x: 0, y: 0 };
        const rect = canvasRef.current.getBoundingClientRect();
        if (e instanceof MouseEvent) {
            return { x: e.clientX - rect.left, y: e.clientY - rect.top };
        } else {
            return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
        }
    }

    const startDrawing = (e: MouseEvent | TouchEvent) => {
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;
        setIsDrawing(true);
        setHasDrawn(true);
        const { x, y } = getPosition(e);
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const draw = (e: MouseEvent | TouchEvent) => {
        if (!isDrawing) return;
        e.preventDefault();
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;
        const { x, y } = getPosition(e);
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000';
        
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseleave', stopDrawing);
        canvas.addEventListener('touchstart', startDrawing, { passive: false });
        canvas.addEventListener('touchmove', draw, { passive: false });
        canvas.addEventListener('touchend', stopDrawing);
        
        return () => {
            canvas.removeEventListener('mousedown', startDrawing);
            canvas.removeEventListener('mousemove', draw);
            canvas.removeEventListener('mouseup', stopDrawing);
            canvas.removeEventListener('mouseleave', stopDrawing);
            canvas.removeEventListener('touchstart', startDrawing);
            canvas.removeEventListener('touchmove', draw);
            canvas.removeEventListener('touchend', stopDrawing);
        };
    }, [isDrawing]);

    const handleClear = () => {
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx && canvasRef.current) {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            setHasDrawn(false);
        }
    };
    
    const handleSave = () => {
        if (!parentName.trim() || !hasDrawn) {
            alert('Por favor, introduzca el nombre y la firma del tutor.');
            return;
        }
        const signatureDataUrl = canvasRef.current?.toDataURL('image/png') || '';
        onSave({ parentName, signatureDataUrl });
    };

    return (
        <Modal onClose={onClose}>
            <div style={styles.form}>
                <h3 style={styles.h2}>Registro de Autorización</h3>
                <p>Alimento a autorizar: <strong>{foodName}</strong></p>
                <p>Fecha: <strong>{new Date().toLocaleDateString('es-ES')}</strong></p>
                <input style={styles.input} type="text" placeholder="Nombre completo del padre/tutor" value={parentName} onChange={e => setParentName(e.target.value)} />
                <label style={{color: 'var(--text-secondary)'}}>Firme en el recuadro:</label>
                <canvas ref={canvasRef} width="440" height="150" style={styles.signatureCanvas}></canvas>
                <div style={{display: 'flex', justifyContent: 'space-between', gap: '1rem'}}>
                    <button style={{...styles.button, ...styles.buttonSecondary}} type="button" onClick={handleClear}>Limpiar</button>
                    <button style={styles.button} type="button" onClick={handleSave}>Guardar Autorización</button>
                </div>
            </div>
        </Modal>
    )
};


interface StudentManagerProps { students: Students; setStudents: React.Dispatch<React.SetStateAction<Students>>; }
const StudentManager = ({ students, setStudents }: StudentManagerProps) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [classId, setClassId] = useState('Clase A');
    const [editingStudent, setEditingStudent] = useState<[string, Student] | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!firstName || !lastName || !classId) return;
        const newStudent: Student = { firstName, lastName, classId, authorizedFoods: {}, authorizations: [] };
        const newId = `student_${Date.now()}`;
        setStudents(prev => ({...prev, [newId]: newStudent}));
        setFirstName('');
        setLastName('');
    };

    const handleDelete = (studentId: string) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar a este alumno?')) {
            setStudents(prev => {
                const next = { ...prev };
                delete next[studentId];
                return next;
            });
        }
    };
    
    const handleSaveEdit = (studentId: string, updatedStudent: Student) => {
        setStudents(prev => ({ ...prev, [studentId]: updatedStudent }));
        setEditingStudent(null);
    };

    const EditStudentForm: React.FC<{ student: Student, studentId: string, onSave: (id: string, student: Student) => void }> = ({ student, studentId, onSave }) => {
        const [currentStudent, setCurrentStudent] = useState(student);
        const [newFood, setNewFood] = useState('');
        const [authorizingFood, setAuthorizingFood] = useState<string | null>(null);
        
        const handleFormSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            onSave(studentId, currentStudent);
        };

        const handleAuthorizeClick = () => {
            if(!newFood.trim() || currentStudent.authorizedFoods[newFood.trim()]) return;
            setAuthorizingFood(newFood.trim());
        }

        const handleSaveAuthorization = ({ parentName, signatureDataUrl }: Omit<Authorization, 'foodName' | 'date'>) => {
            if (!authorizingFood) return;
            const date = new Date().toISOString();
            setCurrentStudent(prev => ({
                ...prev,
                authorizedFoods: {
                    ...prev.authorizedFoods,
                    [authorizingFood]: date
                },
                authorizations: [
                    ...prev.authorizations,
                    { foodName: authorizingFood, date, parentName, signatureDataUrl }
                ]
            }));
            setNewFood('');
            setAuthorizingFood(null);
        };

        return (
            <>
                <form onSubmit={handleFormSubmit} style={styles.form}>
                    <h3 style={styles.h2}>Editar Alumno</h3>
                    <input style={styles.input} type="text" value={currentStudent.firstName} onChange={e => setCurrentStudent(s => ({...s, firstName: e.target.value}))} />
                    <input style={styles.input} type="text" value={currentStudent.lastName} onChange={e => setCurrentStudent(s => ({...s, lastName: e.target.value}))} />
                    <input style={styles.input} type="text" value={currentStudent.classId} onChange={e => setCurrentStudent(s => ({...s, classId: e.target.value}))} />
                    <div>
                        <strong>Alimentos Autorizados:</strong>
                        <p>{Object.keys(currentStudent.authorizedFoods).join(', ') || 'Ninguno'}</p>
                        <div style={{display: 'flex', gap: '0.5rem', marginTop: '0.5rem'}}>
                            <input style={{...styles.input, flex: 1}} type="text" placeholder="Autorizar nuevo alimento" value={newFood} onChange={e => setNewFood(e.target.value)} />
                            <button style={styles.button} type="button" onClick={handleAuthorizeClick}>Autorizar</button>
                        </div>
                    </div>
                    <button style={styles.button} type="submit">Guardar Cambios</button>
                </form>
                {authorizingFood && (
                    <SignaturePad 
                        foodName={authorizingFood} 
                        onClose={() => setAuthorizingFood(null)}
                        onSave={handleSaveAuthorization}
                    />
                )}
            </>
        )
    };

    return (
        <>
             <div style={styles.card}>
                <h2 style={styles.h2}>Añadir Alumno</h2>
                <form onSubmit={handleSubmit} style={styles.form}>
                    <input style={styles.input} type="text" placeholder="Nombre" value={firstName} onChange={e => setFirstName(e.target.value)} />
                    <input style={styles.input} type="text" placeholder="Apellidos" value={lastName} onChange={e => setLastName(e.target.value)} />
                    <input style={styles.input} type="text" placeholder="Clase" value={classId} onChange={e => setClassId(e.target.value)} />
                    <button style={styles.button} type="submit">Añadir Alumno</button>
                </form>
            </div>
            <div style={styles.grid}>
                {Object.entries(students).map(([id, student]) => (
                    <div key={id} style={styles.card}>
                        <h3>{student.firstName} {student.lastName}</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>Clase: {student.classId}</p>
                        <strong>Alimentos Autorizados:</strong>
                        <p>{Object.keys(student.authorizedFoods).join(', ') || 'Ninguno'}</p>
                        <div style={styles.cardActions}>
                            <button style={{...styles.button, ...styles.buttonSecondary}} onClick={() => setEditingStudent([id, student])}>Editar</button>
                            <button style={{...styles.button, ...styles.buttonDanger}} onClick={() => handleDelete(id)}>Eliminar</button>
                        </div>
                    </div>
                ))}
            </div>
            {editingStudent && (
                <Modal onClose={() => setEditingStudent(null)}>
                    <EditStudentForm student={editingStudent[1]} studentId={editingStudent[0]} onSave={handleSaveEdit} />
                </Modal>
            )}
        </>
    );
};

interface MenuManagerProps { menus: Menus; setMenus: React.Dispatch<React.SetStateAction<Menus>>; dishes: Dishes; }
const MenuManager = ({ menus, setMenus, dishes }: MenuManagerProps) => {
    const emptyDays: Record<DaysOfWeek, DayDishes> = { monday: {}, tuesday: {}, wednesday: {}, thursday: {}, friday: {} };
    const [menuName, setMenuName] = useState('');
    const [menuDays, setMenuDays] = useState<Record<DaysOfWeek, DayDishes>>(emptyDays);
    const [editingMenuId, setEditingMenuId] = useState<string | null>(null);

    const handleDishSelect = (day: DaysOfWeek, meal: keyof DayDishes, dishId: string) => {
        setMenuDays(prev => ({...prev, [day]: {...prev[day], [meal]: dishId || undefined }}));
    };
    
    const resetForm = () => {
        setMenuName('');
        setMenuDays(emptyDays);
        setEditingMenuId(null);
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!menuName) return;

        if (editingMenuId) {
            // Update
            setMenus(prev => ({ ...prev, [editingMenuId]: { ...prev[editingMenuId], name: menuName, days: menuDays }}));
        } else {
            // Create
            const newMenu: Menu = {name: menuName, days: menuDays };
            const newId = `menu_${Date.now()}`;
            setMenus(prev => ({...prev, [newId]: newMenu}));
        }
        resetForm();
    };

    const handleEdit = (menuId: string, menu: Menu) => {
        setEditingMenuId(menuId);
        setMenuName(menu.name);
        setMenuDays(menu.days);
        window.scrollTo(0, 0); // Scroll to top to see the form
    };

    const handleDelete = (menuId: string) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este menú?')) {
            setMenus(prev => {
                const next = { ...prev };
                delete next[menuId];
                return next;
            });
            if (editingMenuId === menuId) {
                resetForm();
            }
        }
    };

    return (
        <>
            <div style={styles.card}>
                <h2 style={styles.h2}>{editingMenuId ? 'Editar Menú' : 'Crear Nuevo Menú'}</h2>
                <form onSubmit={handleSubmit} style={styles.form}>
                    <input style={styles.input} type="text" placeholder="Nombre del Menú (ej. Semana 2)" value={menuName} onChange={e => setMenuName(e.target.value)} />
                    <div style={styles.reportContainer}>
                        {(Object.keys(dayNames) as DaysOfWeek[]).map(day => (
                            <div key={day} style={styles.dayColumn}>
                                <h4 style={{marginTop: '1rem'}}>{capitalize(dayNames[day])}</h4>
                                <select style={{...styles.select, width: '100%', marginBottom: '0.5rem'}} value={menuDays[day]?.dish1 || ''} onChange={e => handleDishSelect(day, 'dish1', e.target.value)}>
                                    <option value="">Plato 1</option>
                                    {Object.entries(dishes).map(([id, dish]) => <option key={id} value={id}>{dish.name}</option>)}
                                </select>
                                <select style={{...styles.select, width: '100%', marginBottom: '0.5rem'}} value={menuDays[day]?.dish2 || ''} onChange={e => handleDishSelect(day, 'dish2', e.target.value)}>
                                    <option value="">Plato 2</option>
                                    {Object.entries(dishes).map(([id, dish]) => <option key={id} value={id}>{dish.name}</option>)}
                                </select>
                                <select style={{...styles.select, width: '100%'}} value={menuDays[day]?.dessert || ''} onChange={e => handleDishSelect(day, 'dessert', e.target.value)}>
                                    <option value="">Postre</option>
                                    {Object.entries(dishes).map(([id, dish]) => <option key={id} value={id}>{dish.name}</option>)}
                                </select>
                            </div>
                        ))}
                    </div>
                    <div style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
                        <button style={styles.button} type="submit">{editingMenuId ? 'Actualizar Menú' : 'Guardar Menú'}</button>
                        {editingMenuId && <button style={{...styles.button, ...styles.buttonSecondary}} type="button" onClick={resetForm}>Cancelar Edición</button>}
                    </div>
                </form>
            </div>
            {Object.entries(menus).map(([id, menu]) => (
                 <div key={id} style={styles.card}>
                     <h2 style={styles.h2}>{menu.name}</h2>
                     <div style={styles.reportContainer}>
                        {(Object.entries(menu.days) as [DaysOfWeek, DayDishes][]).map(([day, dayDishes]) => (
                            <div key={day} style={styles.dayColumn}>
                                <h4 style={{color: 'var(--primary-color)'}}>{dayNames[day]}</h4>
                                <ul style={{listStyle: 'none', paddingLeft: 0, color: 'var(--text-secondary)'}}>
                                    <li>{dayDishes.dish1 ? dishes[dayDishes.dish1]?.name : '...'}</li>
                                    <li>{dayDishes.dish2 ? dishes[dayDishes.dish2]?.name : '...'}</li>
                                    <li>{dayDishes.dessert ? dishes[dayDishes.dessert]?.name : '...'}</li>
                                </ul>
                            </div>
                        ))}
                     </div>
                     <div style={styles.cardActions}>
                        <button style={{...styles.button, ...styles.buttonSecondary}} onClick={() => handleEdit(id, menu)}>Editar</button>
                        <button style={{...styles.button, ...styles.buttonDanger}} onClick={() => handleDelete(id)}>Eliminar</button>
                    </div>
                 </div>
            ))}
        </>
    )
};

const App = () => {
    const [activeTab, setActiveTab] = useState('report');
    const [dishes, setDishes] = useState<Dishes>(initialDishes);
    const [students, setStudents] = useState<Students>(initialStudents);
    const [menus, setMenus] = useState<Menus>(initialMenus);

    const renderContent = () => {
        switch (activeTab) {
            case 'report': return <AlertReport students={students} menus={menus} dishes={dishes} />;
            case 'dishes': return <DishManager dishes={dishes} setDishes={setDishes} />;
            case 'students': return <StudentManager students={students} setStudents={setStudents} />;
            case 'menus': return <MenuManager menus={menus} setMenus={setMenus} dishes={dishes} />;
            default: return null;
        }
    };

    const tabs = [
        { id: 'report', label: 'Informe de Alertas' },
        { id: 'dishes', label: 'Platos' },
        { id: 'students', label: 'Alumnos' },
        { id: 'menus', label: 'Menús' },
    ];

    return (
        <>
            <header style={styles.header}>
                <img src={logoDataUrl} alt="Logo de Nelsan" style={styles.logo} />
                <h1 style={styles.title}>🍎 Gestión de Menús Infantiles</h1>
            </header>
            <nav style={styles.nav}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        style={{ ...styles.navButton, ...(activeTab === tab.id ? styles.navButtonActive : {}) }}
                        onClick={() => setActiveTab(tab.id)}
                        aria-pressed={activeTab === tab.id}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>
            <main>
                {renderContent()}
            </main>
        </>
    );
};

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);