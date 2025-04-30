import { LightningElement,track } from 'lwc';
import getWeatherApiResponse from '@salesforce/apex/weatherApiController.getWeatherApiResponse';
import cloudy from '@salesforce/resourceUrl/Cloudy';
import partlyCloudy from '@salesforce/resourceUrl/PartlyCloudy';
import sunny from '@salesforce/resourceUrl/Sunny';
import clear from '@salesforce/resourceUrl/Clear';
import overCast from '@salesforce/resourceUrl/Overcast';
import mist from '@salesforce/resourceUrl/Mist';
import thunder from '@salesforce/resourceUrl/Thunder';
import snow from '@salesforce/resourceUrl/Snow';

export default class WeatherApiLwc extends LightningElement {

    @track showResponse = false;
    @track isLoading = false;
    @track weatherPngUrl;
    @track temperature;
    @track time;
    @track mapMarkers;
    // Info: options of location combobox
    get options() {
        return [
            { label: 'Toronto, ON', value: 'Toronto' },
            { label: 'Montreal, QC', value: 'Montreal' },
            { label: 'Calgary, AB', value: 'Calgary' },
            { label: 'Ottawa, ON', value: 'Ottawa'},
            { label: 'Edmonton, AB', value: 'Edmonton'},
            { label: 'Halifax, NS', value: 'Halifax'}
        ];
    }


    /**
     * @description: method to call the apex method which will call the weather api to get data
     */
    handleLocationChange(event){
        const location = event.target.value;
        this.isLoading = true;
        getWeatherApiResponse({location: location})
        .then(response => {
            this.showResponse = true;
            this.isLoading = false;
            console.log(response);
            this.handleResponse(response);
        })
        .catch(error =>{
            this.showResponse = false;
            this.isLoading = true;
            console.log(error.message);
        })
    }

    /**
     * @description: method to handle response from the api
    */
   handleResponse(response){
    
        //Extract condition
        let condition = response.condition;
        
        console.log(condition);

        if (condition === 'Sunny') {
            this.weatherPngUrl = sunny;
        } else if (condition === 'Clear'){
            this.weatherPngUrl = clear;
        } else if (condition === 'Partly cloudy') {
            this.weatherPngUrl = partlyCloudy;
        } else if (condition === 'Cloudy') {
            this.weatherPngUrl = cloudy;
        } else if (condition === 'Overcast') {
            this.weatherPngUrl = overCast;
        } else if (
            condition === 'Mist' ||
            condition === 'Fog' ||
            condition === 'Freezing fog'
        ) {
            this.weatherPngUrl = mist;
        } else if (
            condition === 'Thundery outbreaks possible' ||
            condition === 'Patchy light rain with thunder' ||
            condition === 'Moderate or heavy rain with thunder' ||
            condition === 'Patchy light snow with thunder' ||
            condition === 'Moderate or heavy snow with thunder'
        ) {
            this.weatherPngUrl = thunder;
        } else if (
            condition.includes('snow') ||
            condition.includes('Snow') ||
            condition.includes('sleet') ||
            condition.includes('Sleet') ||
            condition.includes('ice pellets') ||
            condition.includes('Ice pellets') ||
            condition.includes('freezing drizzle') ||
            condition.includes('Freezing drizzle') ||
            condition.includes('freezing rain') ||
            condition.includes('Freezing rain') ||
            condition.includes('Blizzard') ||
            condition.includes('Blowing snow')
        ) {
            this.weatherPngUrl = snow;
        } else {
            // Default to cloudy if no match is found
            this.weatherPngUrl = cloudy;
        }

        this.temperature = response.temperatureC;
        this.time = response.localTime;
        this.mapMarkers = [
            {
                location: {
                    City: response.city,
                    Country: response.country,
                },
                title: response.city
            }
        ];
   }



}