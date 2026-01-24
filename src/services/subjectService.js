import api from './api';

const getAll = () => {
    return api.get('/subjects');
};

const create = (data) => {
    return api.post('/subjects', data);
};

// Exportujemo kao objekat (slično kao public metode u Angular servisu)
export default {
    getAll,
    create
};