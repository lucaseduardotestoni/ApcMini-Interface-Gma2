import './styles/modal.css';
import { useState,useEffect } from 'react';
import ConfigService from '../Service/ConfigService.js';

export default function ModalKnobConfig({ knobIndex, onClose,onUpdateKnobs  }) {
  const [executor, setExecutor] = useState('1');
  const [page, setPage] = useState('1');
  const [tipo, setTipo] = useState('1');
  const [error, setError] = useState(null); // Novo estado para exibir erros no modal
  const [isKnobSavedInitially, setIsKnobSavedInitially] = useState(false); // NOVO ESTADO: indica se o knob já tem config salva
  // Carrega a configuração do knob ao montar o componente
   const loadKnobConfig = async () => {
    setError(null); // Limpa erros anteriores ao carregar
    try {
      const data = await ConfigService.getKnob(knobIndex); // Busca os dados do knob

      // Lógica para determinar se o knob já tem dados significativos salvos.
      // Consideramos "salvo" se algum dos campos (type, executor, page) for diferente do seu valor padrão.
      // Os valores padrão do backend para um knob não salvo são: type: 0, executor: '101', page: 0.
      const hasMeaningfulData = data.type !== 1 || data.executor !== '101' || data.page !== 1;
      setIsKnobSavedInitially(hasMeaningfulData);

      // Seta os estados com os dados carregados ou com os padrões se undefined
      setExecutor(data.executor ? String(data.executor) : '101'); // Garante string para input
      setTipo(data.type !== undefined ? String(data.type) : '1'); // Garante string para select, padrão '0'
      setPage(data.page !== undefined ? String(data.page) : '1'); // Garante string para input, padrão '0'

    } catch (err) {
      console.error("Erro ao carregar dados do knob:", err);
      setError("Não foi possível carregar as configurações do knob.");
      setIsKnobSavedInitially(false); // Se deu erro ao carregar, não é considerado salvo
      // Em caso de erro, redefina para valores padrão para que o usuário possa salvar
      setExecutor('101');
      setPage('1');
      setTipo('1');
    }
  };
  // Carrega a configuração do knob ao montar o componente
  useEffect(() => {
    loadKnobConfig();
  }, [knobIndex]);

  const handleSave = async () => {
    const knobAlterado = {
      notation: knobIndex,
      executor,
      type: tipo,
      page: parseInt(page, 10) || 0
    };
    try {
      const result = await ConfigService.saveKnobConfig(knobAlterado); // Salva os dados no backend

      if (result && result.message && result.message.includes('sucesso')) {
        // --- AQUI ESTÁ A CHAVE: Chama a função de atualização do ApcMiniGrid ---
        if (onUpdateKnobs) { // Verifica se a prop foi passada
          onUpdateKnobs(); // Dispara o recarregamento dos knobs no ApcMiniGrid
        }
        onClose(); // Fecha o modal após o salvamento bem-sucedido
      } else {
        // Se o backend retornou uma mensagem de erro que não é HTTP 4xx, mas está no JSON
        setError(result.message || 'Erro desconhecido ao salvar.');
      }
    } catch (err) {
      // Erros de rede ou erros HTTP (como 400, 500) que resultam em throw new Error no ConfigService
      console.error("Erro ao salvar configuração do knob:", err);
      setError(`Erro ao salvar: ${err.message || 'Verifique o console para detalhes.'}`);
    }
  }

  return (
    <div className="modal" id="knobConfigModal">
      <div className="modal-content">
        <h2>Configurar knob {knobIndex}</h2>

        <form  onSubmit={e => { e.preventDefault(); handleSave(); }}>
          <label>
            Executor:
            <input
              type="text"
              name="executor"
              value={executor}
              onChange={e => setExecutor(e.target.value)}
            />
          </label>
          <label>
            Tipo:
            <select
              name="tipo"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
            >
              <option value="1">Go+</option>
              <option value="2">Flash</option>
              <option value="2">Toggle</option>
            </select>
          </label>
          
          <label>
            Página:
            <input
              type="number"
              name="page"
              value={page}
              min="1"
              onChange={e => setPage(e.target.value)}
            />
          </label>
        </form>
        <button onClick={handleSave}>Salvar</button>
        <button onClick={onClose}>Fechar</button>
      </div>
    </div>
  );
}
