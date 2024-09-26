import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Picker } from 'react-native';
import { Line, Bar } from 'react-chartjs-2';
import 'chart.js/auto';

export default function GraphScreen({ route }) {
  const [sensorData, setSensorData] = useState([]);
  const [chartType, setChartType] = useState('line');
  const [timeRange, setTimeRange] = useState('lastHour');
  const { token } = route.params;

  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        const response = await fetch('http://localhost:3000/dados-sensores', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        const filteredData = filterSensorData(data); // Aplicar filtro
        setSensorData(filteredData);
      } catch (error) {
        console.error('Erro ao buscar dados dos sensores:', error);
      }
    };

    fetchSensorData();
  }, [token, timeRange]);

  const filterSensorData = (data) => {
    const now = new Date();
    return data.filter(item => {
      const itemDate = new Date(item.timestamp);
      switch (timeRange) {
        case 'lastHour':
          return itemDate >= new Date(now - 60 * 60 * 1000);
        case 'last24Hours':
          return itemDate >= new Date(now - 24 * 60 * 60 * 1000);
        case 'lastWeek':
          return itemDate >= new Date(now - 7 * 24 * 60 * 60 * 1000);
        case 'last30Days':
          return itemDate >= new Date(now - 30 * 24 * 60 * 60 * 1000);
        default:
          return true;
      }
    });
  };

  const data = {
    labels: sensorData.map(item => new Date(item.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: 'Temperatura',
        data: sensorData.map(item => item.temperatura),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: false,
        tension: 0.1,
        yAxisID: 'y',
      },
      {
        label: 'Umidade',
        data: sensorData.map(item => item.umidade),
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: false,
        tension: 0.1,
        yAxisID: 'y1',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Desativa a manutenção da relação de aspecto para controlar a altura
    scales: {
      x: {
        title: {
          display: true,
          text: 'Tempo',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Temperatura (°C)',
        },
        beginAtZero: true,
        position: 'left',
        id: 'y',
      },
      y1: {
        title: {
          display: true,
          text: 'Umidade (%)',
        },
        beginAtZero: true,
        position: 'right', // Umidade no eixo Y à direita
        grid: {
          drawOnChartArea: false, // Não desenha a grade sobre o gráfico da temperatura
        },
      },
    },
  };

  const renderChart = () => {
    const chartComponent = chartType === 'line' ? <Line data={data} options={options} /> : <Bar data={data} options={options} />;
    
    return (
      <View style={styles.chartWrapper}>
        {chartComponent}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gráfico de Dados dos Sensores</Text>
      <Picker
        selectedValue={timeRange}
        style={styles.picker}
        onValueChange={(itemValue) => setTimeRange(itemValue)}
        itemStyle={styles.pickerItem}
      >
        <Picker.Item label="Última Hora" value="lastHour" />
        <Picker.Item label="Últimas 24 Horas" value="last24Hours" />
        <Picker.Item label="Última Semana" value="lastWeek" />
        <Picker.Item label="Últimos 30 Dias" value="last30Days" />
      </Picker>
      <Picker
        selectedValue={chartType}
        style={styles.picker}
        onValueChange={(itemValue) => setChartType(itemValue)}
        itemStyle={styles.pickerItem}
      >
        <Picker.Item label="Linha" value="line" />
        <Picker.Item label="Barra" value="bar" />
      </Picker>
      <View style={styles.chartContainer}>
        {renderChart()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'flex-start', 
    alignItems: 'flex-start', 
    padding: 20 
  },
  chartContainer: {
    flex: 1,
    width: '100%',
    paddingBottom: 20,
    paddingHorizontal: 20,
    justifyContent: 'center', // Centraliza o gráfico
  },
  chartWrapper: {
    flex: 1,
    padding: 20, // Aplica padding ao redor do gráfico
    backgroundColor: '#fff', // Caso queira um fundo branco
    borderRadius: 10, // Adiciona bordas arredondadas ao gráfico
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // Sombra no Android
  },
  title: { 
    fontSize: 18, 
    marginBottom: 10 
  },
  picker: { 
    height: 40, 
    width: 150, 
    marginBottom: 20, 
    borderColor: '#ccc', 
    borderWidth: 1, 
    borderRadius: 5 
  },
  pickerItem: { 
    height: 40 
  },
});
