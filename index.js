/* Rotas das funções JS */

const express = require('express');
const path = require('path');
const admin = require('firebase-admin');
const serviceAccount = require('./chave-firebase.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const firestore = admin.firestore();
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Rota: Criar chamado
app.post('/api/chamados', async (req, res) => {
  try {
    const { local, problema, professor, numero, equipamentos  } = req.body;

    if (!local || !problema || !professor || !numero || !Array.isArray(equipamentos)) {
      return res.status(400).send('Campos obrigatórios faltando ou inválidos');
    }

    const status = 'Aberto';

    const agora = new Date();
    const dia = String(agora.getDate()).padStart(2, '0');
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const ano = agora.getFullYear();
    const hora = String(agora.getHours()).padStart(2, '0');
    const minutos = String(agora.getMinutes()).padStart(2, '0');
    const segundos = String(agora.getSeconds()).padStart(2, '0');
    const data = `${dia}/${mes}/${ano} ${hora}:${minutos}:${segundos}`;

    const docRef = await firestore.collection('chamados').add({
      local,
      problema,
      professor,
      numero,
      equipamentos,
      status,
      data
    });

    res.status(201).send({ id: docRef.id });
  } catch (err) {
    console.error('Erro ao salvar chamado:', err);
    res.status(500).send('Erro ao salvar chamado');
  }
});

// Rota: Listar chamados
app.get('/api/chamados', async (req, res) => {
  try {
    const snapshot = await firestore.collection('chamados').orderBy('data', 'desc').get();
    const chamados = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(chamados);
  } catch (err) {
    console.error('Erro ao buscar chamados:', err);
    res.status(500).send('Erro ao buscar chamados');
  }
});

// Rota: Atualizar status do chamado
app.put('/api/chamados/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const chamadoRef = firestore.collection('chamados').doc(id);
    const chamadoDoc = await chamadoRef.get();

    if (!chamadoDoc.exists) {
      return res.status(404).send('Chamado não encontrado');
    }

    await chamadoRef.update({ status });
    res.send('Status atualizado com sucesso');
  } catch (err) {
    console.error('Erro ao atualizar status:', err);
    res.status(500).send('Erro ao atualizar status');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});