![Google Maps Tests](https://github.com/Axway-API-Builder-Ext/api-builder-extras/workflows/Google%20Maps%20Tests/badge.svg)

# API-Builder Google-Maps Connector

Integrate Google-Maps services into your [API-Builder flow][1] using this connector.

## Configuration

After installation and restarting your API-Builder project you get the following new flow-nodes:  
![Node][img1]   
Before you can make use it in your flow you have to configure your Google API-Key, which must be activated for the correct Google-APIs. Access the [Google Console][6] and learn more [here][7].  

During installation a new config file has been automatically created which must be completed with your Google-API-Key. You can do that directly from within the API-Builder UI:  
![Config][img3]  
We recommend to setup your configuration in a [environmentalized][4] way keeping [sensitive information][5] away from the source-code repository.

## Google-Maps services
This Connector is based on the https://github.com/googlemaps/google-maps-services-js project. It's a good starting point to understand the APIs and their parameters reading the following documentation:   

- [Directions API](https://developers.google.com/maps/documentation/directions/start)
- [Distance Matrix API](https://developers.google.com/maps/documentation/distance-matrix/start)
- [Elevation API](https://developers.google.com/maps/documentation/elevation/)
- [Geocoding API](https://developers.google.com/maps/documentation/geocoding/)
- [Places API](https://developers.google.com/places/web-service/)


## Compatibility
Tested with Google-Maps Q1/2020  
Requires API-Builder Independence or higher

## Changelog
- 1.0.0 - 21.02.2020
  - Initial version

## Limitations/Caveats
The follow APIs are not yet supported:
- Place Photos
- Place Autocomplete
- Query Autocomplete
- Roads API
- Time Zone API
- Reverse geocoding API

If you require on the of the unsupported APIs don't hestitate to create an [issue][3]

## Contributing

Please read [Contributing.md](https://github.com/Axway-API-Management-Plus/Common/blob/master/Contributing.md) for details on our code of conduct, and the process for submitting pull requests to us.  

## Team

![alt text][Axwaylogo] Axway Team

[Axwaylogo]: https://github.com/Axway-API-Management/Common/blob/master/img/AxwayLogoSmall.png  "Axway logo"

[1]: https://docs.axway.com/bundle/API_Builder_4x_allOS_en/page/api_builder_flows.html
[2]: https://docs.axway.com/bundle/API_Builder_4x_allOS_en/page/api_builder_getting_started_guide.html
[3]: https://github.com/Axway-API-Builder-Ext/api-builder-extras/issues
[4]: https://docs.axway.com/bundle/API_Builder_4x_allOS_en/page/environmentalization.html
[5]: https://docs.axway.com/bundle/API_Builder_4x_allOS_en/page/project_configuration.html#ProjectConfiguration-Configurationfiles
[6]: https://console.cloud.google.com
[7]: https://developers.google.com/maps/documentation/javascript/get-api-key

[img1]: imgs/google-maps-flownode.png
[img2]: imgs/google-maps-directions.png
[img3]: imgs/google-maps-config.png
