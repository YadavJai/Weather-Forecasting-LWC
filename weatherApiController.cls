/**
 * @description: controller class for the weatherApiLwc
 */
public with sharing class weatherApiController {
    
    public weatherApiController() {
        //constructor
    }

    /**
     * @description: method to call the weather api
     * @param: location
     * @return: Map<String,Object>
     */
    @AuraEnabled
    public static Map<String,Object> getWeatherApiResponse(String location){
        
        Map<String, Object> weatherData = new Map<String, Object>();

        // Define the API endpoint
        String endpoint = 'http://api.weatherapi.com/v1/current.json?key=fc968d6da99e48158d4103900242412&q=' + location + '&aqi=no';

        try{
            // Create an HttpRequest object
            HttpRequest req = new HttpRequest();
            req.setEndpoint(endpoint);
            req.setMethod('GET');

            // Send the request and get the response
            Http http = new Http();
            HttpResponse res = http.send(req);

            // Check the response status code
            if (res.getStatusCode() == 200) {
                // Parse the JSON response
                Map<String, Object> responseMap = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());

                // Extract the desired data
                Map<String, Object> locationMap = (Map<String, Object>) responseMap.get('location');
                Map<String, Object> currentMap = (Map<String, Object>) responseMap.get('current');

                Decimal tempC = (Decimal) currentMap.get('temp_c');
                String localTime = (String) locationMap.get('localtime');
                localTime = localTime.substring(11); // Extracting only the time part
                String condition = (String) ((Map<String, Object>) currentMap.get('condition')).get('text');
                String country = (String) locationMap.get('country');
                String city = (String) locationMap.get('name');

                // Store the extracted data in the map
                weatherData.put('temperatureC', tempC);
                weatherData.put('localTime', localTime);
                weatherData.put('condition', condition);
                weatherData.put('country', country);
                weatherData.put('city', city);

            } else {
                // Return an error message if the status code is not 200
                weatherData.put('error', 'Error: ' + res.getStatusCode() + ' - ' + res.getStatus());
            }
        }catch(Exception ex){
            System.debug('Error Message' + ex.getMessage());
            System.debug('Error Line Number' + ex.getLineNumber());
        }

        return weatherData;

    }


}