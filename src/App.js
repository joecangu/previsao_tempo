import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Navbar, Button, Form, ListGroup, Alert, Modal } from 'react-bootstrap';
import { FaSearch, FaTemperatureHigh, FaRegSnowflake, FaSun, FaRegMoon, FaCloudSun, FaSave, FaClone, FaHistory } from 'react-icons/fa';
import apiConfig from './config/apiConfig';
import { ToastContainer, toast } from 'react-toastify';
// CSS DO TOASTIFY
import 'react-toastify/dist/ReactToastify.css';

// CONFIGURAÇÃO VIA API
const API_VIACEP = 'https://viacep.com.br/ws';
const API_WEATHERSTACK = 'http://api.weatherstack.com/current';
const API_KEY_WEATHERSTACK = '913431a6b8a31098633e6eac29a49056'; 

function App() {
  const [cep, setCep] = useState('');
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [errorModal, setErrorModal] = useState(null);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [compareCity, setCompareCity] = useState('');
  const [compareCep, setCompareCep] = useState('');
  const [comparisonResults, setComparisonResults] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  const handleCepChange = (e) => setCep(e.target.value);
  const handleCityChange = (e) => setCity(e.target.value);
  const handleCompareCityChange = (e) => setCompareCity(e.target.value);
  const handleCompareCepChange = (e) => setCompareCep(e.target.value);

  //Função para pesquisar a cidade de acordo com o CEP
  const handleCepSearch = async () => {
    try {
      const response = await axios.get(`${API_VIACEP}/${cep}/json`);
      if (response.data.localidade) {
        setCity(response.data.localidade);
      } else {
        setError('CEP não encontrado.');
      }
    } catch (err) {
      setError('Erro ao buscar CEP.');
    }
  };

  // Pesquisa a previsão do tempo de acordo com a cidade solicitada
  const handleCitySearch = async () => {
    if (!city) {
      setError('Por favor, informe o nome da cidade.');
      return;
    }
  
    try {
      const response = await axios.get(`${API_WEATHERSTACK}`, {
        params: {
          access_key: API_KEY_WEATHERSTACK,
          query: city
        }
      });
  
      if (response.data.current) {  
        const weatherData = {
          cidade: city,
          temperatura: response.data.current.temperature,
          descricao: response.data.current.weather_descriptions[0],
          data: response.data.location.localtime,
        };
  
        setWeather(weatherData);  
        setError(null);

        // Buscar histórico da cidade pesquisada
        fetchHistory(city);
      } else {
        setError('Cidade não encontrada.');
      }
    } catch (err) {
      setError('Erro ao buscar previsão do tempo.');
    }
  };

  // Função para salvar a previsão do tempo
  const saveWeatherData = async () => {
    if (!weather) return;
    
    try {
      await axios.post(`${apiConfig.API_BASE_URL}/historico`, weather);
      setHistory([...history, weather]);
      setError(null);
      toast.success("Histórico salvo com sucesso!.");
      setShowHistory(true);
    } catch (err) {
      setError('Erro ao salvar dados no banco.');
    }
  };

  //Comparação entre as cidades
  const handleCompare = async () => {
    if (!city || !compareCity) {
      setErrorModal('Por favor, informe as duas cidades para comparação.');
      return;
    }
    
    try {
      const responses = await Promise.all([
        axios.get(`${API_WEATHERSTACK}`, {
          params: {
            access_key: API_KEY_WEATHERSTACK,
            query: city
          }
        }),
        axios.get(`${API_WEATHERSTACK}`, {
          params: {
            access_key: API_KEY_WEATHERSTACK,
            query: compareCity
          }
        })
      ]);

      const results = {
        cidade1: {
          cidade: city,
          temperatura: responses[0].data.current.temperature,
          descricao: responses[0].data.current.weather_descriptions[0],
          data: responses[0].data.location.localtime
        },
        cidade2: {
          cidade: compareCity,
          temperatura: responses[1].data.current.temperature,
          descricao: responses[1].data.current.weather_descriptions[0],
          data: responses[1].data.location.localtime
        }
      };

      setComparisonResults(results);
      setError(null);
    } catch (err) {
      setError('Erro ao comparar as cidades.');
    }
  };

  // Função para escolher o ícone baseado na temperatura
  const getTemperatureIcon = (temperature) => {
    if (temperature > 20) return <FaTemperatureHigh />;
    return <FaRegSnowflake />;
  };

  // Função para escolher o ícone baseado no horário
  const getTimeIcon = (hour) => {
    return hour >= 6 && hour < 18 ? <FaSun /> : <FaRegMoon />;
  };

  //Função para pesquisar o histórico da cidade
  const fetchHistory = async (searchCity) => {
    try {
      const response = await axios.post(`${apiConfig.API_BASE_URL}/consultar`, { cidade: searchCity });
      const newHistory = response.data;
  
      // Atualizar o histórico com os dados da cidade pesquisada
      setHistory(newHistory);
    } catch (error) {
      setError('Erro ao buscar histórico.');
    }
  };

  //Pesquisa a cidade para comparar
  const handleCepToCitySearch = async () => {
    if (!compareCep) {
      setErrorModal('Por favor, informe o CEP.');
      return;
    }
  
    try {
      const response = await axios.get(`${API_VIACEP}/${compareCep}/json`);
      if (response.data.localidade) {
        setCompareCity(response.data.localidade);
        setErrorModal(null);
      } else {
        setErrorModal('CEP não encontrado.');
      }
    } catch (err) {
      setErrorModal('Erro ao buscar CEP.');
    }
  };

  //Monitora a variável city, sempre que recebe um novo valor, executa a função fecthHistory
  useEffect(() => {
    if (city) {
      fetchHistory(city);
    }
  }, [city]);

  return (
    <div className="App">
      <ToastContainer autoclose={5000}/>
      <Navbar bg="primary" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand href="#home">Previsão do Tempo</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
        </Container>
      </Navbar>

      <Container>
        <Row className="my-4">
          <Col md={6} className="offset-md-3">
            <h1><FaCloudSun /> Previsão do Tempo</h1>
            <Form>
              <Form.Group controlId="formCep">
                <Form.Label>CEP</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Informe o CEP"
                  value={cep}
                  onChange={handleCepChange}
                />
                <Button variant="primary" className="mt-2" onClick={handleCepSearch}>
                  <FaSearch /> Consultar CEP
                </Button>
              </Form.Group>
              <br/>
              { city ? (
                <Form.Group controlId="formCity">
                  <Form.Label>Cidade</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Informe o nome da cidade"
                    value={city}
                    onChange={handleCityChange}
                  />
                  <Button variant="success" className="mt-2" onClick={handleCitySearch}>
                    <FaTemperatureHigh /> Buscar
                  </Button>
                  <Button variant="info" className="mt-2 ms-2" onClick={() => setShowCompareModal(true)}>
                    <FaClone /> Comparar Cidades
                  </Button>
                </Form.Group>
                ) : <></>
              }
            </Form>

            {weather && (
              <Alert variant="info" className="mt-4">
                <h4>Previsão do Tempo para {weather.cidade}:</h4>
                <p>{getTemperatureIcon(weather.temperatura)} Temperatura: {weather.temperatura}°C</p>
                <p>{weather.descricao}</p>
                <p>{getTimeIcon(new Date(weather.data).getHours())} Data e Hora: {weather.data}</p>
                <Button variant="primary" onClick={saveWeatherData} className="mt-2">
                  <FaSave /> Salvar
                </Button>
                <Button variant="info" className="mt-2 ms-2" onClick={() => setShowHistory(!showHistory)}>
                  <FaHistory /> Ver Histórico
                </Button>
              </Alert>
            )}

            {/* Exibir histórico fora do Alert */}
            {showHistory && history.length > 0 && (
              <div className="mt-4">
                <h5>Histórico de Pesquisas para {city}:</h5>
                <ListGroup>
                  {history.map((item, index) => (
                    <ListGroup.Item key={index}>
                      <FaCloudSun /> {item.cidade} - {item.temperatura}°C - {item.descricao} ({item.data})
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </div>
            )}

            {error && (
              <Alert variant="danger" className="mt-4">
                {error}
              </Alert>
            )}

            {/* Modal de Comparação */}
            <Modal show={showCompareModal} onHide={() => setShowCompareModal(false)}>
              <Modal.Header closeButton>
                <Modal.Title>Comparar Cidades</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form>
                  <Form.Group controlId="formCompareCity1">
                    <Form.Label>Cidade 1</Form.Label>
                    <Form.Control
                      type="text"
                      value={city}
                      readOnly
                    />
                  </Form.Group>
                  <Form.Group controlId="formCompareCep" className="mt-3">
                    <Form.Label>CEP da Cidade 2</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Informe o CEP da segunda cidade"
                      value={compareCep}
                      onChange={handleCompareCepChange}
                    />
                    <Button variant="secondary" className="mt-2" onClick={handleCepToCitySearch}>
                      Buscar Cidade
                    </Button>
                  </Form.Group>
                  <Form.Group controlId="formCompareCity2" className="mt-3">
                    <Form.Label>Cidade 2</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Informe a segunda cidade"
                      value={compareCity}
                      onChange={handleCompareCityChange}
                    />
                  </Form.Group>
                </Form>
                {errorModal && (
                  <Alert variant="danger" className="mt-4">
                    {errorModal}
                  </Alert>
                )}
                {/* Exibir resultados da comparação */}
                {comparisonResults && (
                  <div className="mt-4">
                    <h3>Comparação entre as cidades</h3>
                    <Alert variant="info">
                      <h4>Previsão do Tempo para {comparisonResults.cidade1.cidade}:</h4>
                      <p>{getTemperatureIcon(comparisonResults.cidade1.temperatura)} Temperatura: {comparisonResults.cidade1.temperatura}°C</p>
                      <p>{comparisonResults.cidade1.descricao}</p>
                      <p>{getTimeIcon(new Date(comparisonResults.cidade1.data).getHours())} Data e Hora: {comparisonResults.cidade1.data}</p>
                    </Alert>
                    <Alert variant="info">
                      <h4>Previsão do Tempo para {comparisonResults.cidade2.cidade}:</h4>
                      <p>{getTemperatureIcon(comparisonResults.cidade2.temperatura)} Temperatura: {comparisonResults.cidade2.temperatura}°C</p>
                      <p>{comparisonResults.cidade2.descricao}</p>
                      <p>{getTimeIcon(new Date(comparisonResults.cidade2.data).getHours())} Data e Hora: {comparisonResults.cidade2.data}</p>
                    </Alert>
                  </div>
                )}
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowCompareModal(false)}>
                  Fechar
                </Button>
                <Button variant="primary" onClick={handleCompare}>
                  Pesquisar
                </Button>
              </Modal.Footer>
            </Modal>
          </Col>
        </Row>
      </Container>

      <footer className="bg-primary text-white text-center py-1">
        <Container>
          <p>&copy; Jhonatan Canguçu 2024</p>
        </Container>
      </footer>
    </div>
  );
}

export default App;