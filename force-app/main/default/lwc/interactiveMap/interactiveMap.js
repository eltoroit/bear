import { LightningElement, api, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import leaflet from '@salesforce/resourceUrl/leaflet';
import { getRecord, updateRecord } from 'lightning/uiRecordApi';
const fields = [
    'Bear__c.Location__Latitude__s',
    'Bear__c.Location__Longitude__s'
];

export default class InteractiveMap extends LightningElement {
    @api recordId;
    leafletInitialized = false;
    map;
    lat;
    lng;

    @wire(getRecord, { recordId: '$recordId', fields})
    loadBear({ error, data }) {
        if (error) {
            // TODO: handle error
        } else if (data) {
            // Get Bear data
            this.lat = data.fields.Location__Latitude__s.value;
            this.lng = data.fields.Location__Longitude__s.value;
            this.initializeMap();
        }
    }

    initializeMap() {
        if (this.leafletInitialized) {
            return;
        }
        this.leafletInitialized = true;

        Promise.all([
            loadScript(this, leaflet + '/leaflet.js'),
            loadStyle(this, leaflet + '/leaflet.css')
        ])
            .then(() => {
                this.initializeleaflet();
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error loading',
                        message: error.message,
                        variant: 'error'
                    })
                );
            });
    }

    initializeleaflet() {
        const mapid = this.template.querySelector(".mapid");
        this.map = L.map(mapid);
        this.map.setView([this.lat, this.lng], 13);
        L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            {
                attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> Contributors',
                maxZoom: 18
            }
        ).addTo(this.map);

        var marker = L.marker([this.lat, this.lng], {draggable: 'true'})
        .addTo(this.map);

        marker.on('dragend', (event) => {
            var marker = event.target;
            var coord = marker.getLatLng();
            this.updateCoordinate(coord.lat, coord.lng);
            marker.setLatLng(new L.LatLng(coord.lat, coord.lng),{draggable:'true'}); 
        });
        this.map.addLayer(marker);
    }

    updateCoordinate(lat, lng) {
        // Create the recordInput object
        const bearFields = {};

        bearFields['Id'] = this.recordId;
        bearFields['Location__Latitude__s'] = lat;
        bearFields['Location__Longitude__s'] = lng;
      
        const recordInput = { fields: bearFields };

        updateRecord(recordInput)
        .then(() => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Bear location updated',
                    variant: 'success'
                })
            );
        })
        .catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error creating record',
                    message: error.message,
                    variant: 'error'
                })
            );
        });
    }
}