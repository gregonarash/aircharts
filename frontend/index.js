import {
    initializeBlock,
    useBase,
    useRecords,
    useGlobalConfig,
    globalConfig,
    TablePickerSynced,
    ViewPickerSynced,
    FieldPickerSynced,
    SelectButtonsSynced,
    Box,
    Button,
    Heading,
    FormField, Input,
} from '@airtable/blocks/ui';
import React, {useState} from 'react';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import {FieldType} from '@airtable/blocks/models';

// This block uses chart.js and the react-chartjs-2 packages.
// Install them by running this in the terminal:
// npm install chart.js react-chartjs-2
import {Bar} from 'react-chartjs-2';

const GlobalConfigKeys = {
    TABLE_ID: 'tableId',
    VIEW_ID: 'viewId',
    X_FIELD_ID: 'xFieldId',
    VALUE_1: 'value1Id',
    VALUE_2: 'value2Id',
    VALUE_3: 'value3Id',
    CHART_TYPE: 'chartType',
    TABLESAVE_ID: 'tableSaveId',
    ATTACHMENT_FIELD_ID: 'attachmentId',
    LINK_FIELD_ID: 'linkId',
};



function SimpleChartBlock() {
    const base = useBase();
    const globalConfig = useGlobalConfig();

    const tableId = globalConfig.get(GlobalConfigKeys.TABLE_ID);
    const table = base.getTableByIdIfExists(tableId);

    const tableSaveId = globalConfig.get(GlobalConfigKeys.TABLESAVE_ID);
    const tableSave = base.getTableByIdIfExists(tableSaveId);

    const viewId = globalConfig.get(GlobalConfigKeys.VIEW_ID);
    const view = table ? table.getViewByIdIfExists(viewId) : null;

    const xFieldId = globalConfig.get(GlobalConfigKeys.X_FIELD_ID);
    const xField = table ? table.getFieldByIdIfExists(xFieldId) : null;

    const attachmentId = globalConfig.get(GlobalConfigKeys.ATTACHMENT_FIELD_ID);
    const attachment = tableSave ? tableSave.getFieldByIdIfExists(attachmentId) : null;

    const linkId = globalConfig.get(GlobalConfigKeys.LINK_FIELD_ID);
    const link = tableSave ? tableSave.getFieldByIdIfExists(linkId) : null;

    const value1Id = globalConfig.get(GlobalConfigKeys.VALUE_1);
    const value1 = table ? table.getFieldByIdIfExists(value1Id) : null;  

    const value2Id = GlobalConfigKeys.VALUE_2 ? globalConfig.get(GlobalConfigKeys.VALUE_2): null ;
    const value2 = table ? table.getFieldByIdIfExists(value2Id) : null;  

    const value3Id = globalConfig.get(GlobalConfigKeys.VALUE_3);
    const value3 = table ? table.getFieldByIdIfExists(value3Id) : null;  

    var chartType =  globalConfig.get(GlobalConfigKeys.CHART_TYPE) == null ? 'bar' : globalConfig.get(GlobalConfigKeys.CHART_TYPE);
    
    
    const records = useRecords(view);

    var data = {};

    if (records && xField && value1 && !value2 && !value3){
         data = getChartData({records, xField, value1, chartType:chartType});
    } else if (records && xField && value1 && value2 && !value3) {
        data = getChartData({records, xField, value1, value2, chartType:chartType }) ;
    } else if (records && xField && value1 && value2 && value3) {
        data = getChartData({records, xField, value1, value2, value3, chartType:chartType }) ;
    } else if (records && xField && value1 && !value2 && value3) {
        data = getChartData({records, xField, value1, value2, value3, chartType:chartType }) ;
    } else {
        data = null;
    }


    const chartPayload = { 'type' : chartType , 'data':  data };
    const encodedPayload = encodeURIComponent(JSON.stringify(chartPayload));

    const shouldButtonBeDisabled = !attachment && !link;
    
    const chartUrl = `https://quickchart.io/chart?bkg=white&c=${encodedPayload}`

    const dataToSave ={
        "tableSave" : tableSave,
        "linkId": linkId,
        "attachmentId": attachmentId,
        "chartUrl": chartUrl,

    }

    

    return (
        <React.Fragment>
        <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            display="flex"
            flexDirection="column"
        >
            <Settings table={table} />
            {data && (
                <React.Fragment>
                <Box position="relative" flex="auto" padding={3}>
                    <img src={chartUrl}
        alt="Airchart"  height = "auto" width = "100%" ></img> 
                </Box>
                
                    
                    <Box display="flex" padding={3}  flexDirection = "column">
                    <div><b>Link to the chart:</b></div>
                    <Box display="flex" padding={3} paddingRight={5} >
                        <Box display="flex" width="50%" paddingRight={1}>
                        <Input
                            value={chartUrl}
                             
                            placeholder="Placeholder"
                             
                        />
                        </Box>
                        <CopyToClipboard text={chartUrl}> 
                            <Button icon="clipboard" width="33%" >
                            Copy link to the chart
                            </Button>
                               
                        </CopyToClipboard>
                    
                     </Box></Box>
                    <br></br>
                    <br></br>
                
                <Box position="relative" flex="auto" padding={3}>
                <Heading> Save the image or link to your base </Heading>
                <div><b>Select table (different from your data table) to store image and link</b></div>
                    
                <React.Fragment>
        <Box display="flex" padding={3} flexDirection = "column">
            <Box display="flex" padding={3} borderBottom="thick">
                <FormField label="Table" width="33%" paddingRight={1} marginBottom={0}>
                    <TablePickerSynced globalConfigKey={GlobalConfigKeys.TABLESAVE_ID} />
                </FormField>
                {tableSave && (
                    <FormField label="Attachment column" width="33%" paddingLeft={1} marginBottom={0}>
                    <FieldPickerSynced
                        table={tableSave}
                        globalConfigKey={GlobalConfigKeys.ATTACHMENT_FIELD_ID}
                        shouldAllowPickingNone={true}
                        allowedTypes={[FieldType.MULTIPLE_ATTACHMENTS]}
                    />
                </FormField>
                )}
                {tableSave && (
                    <FormField label="Image link column" width="33%" paddingLeft={1} marginBottom={0}>
                    <FieldPickerSynced
                        table={tableSave}
                        globalConfigKey={GlobalConfigKeys.LINK_FIELD_ID}
                        shouldAllowPickingNone={true}
                        allowedTypes={[FieldType.SINGLE_LINE_TEXT,FieldType.MULTILINE_TEXT,FieldType.RICH_TEXT,FieldType.URL]}
                    />
                </FormField>
                    
                )}

            </Box>
            
        </Box>
            
        <Box display="flex" flexDirection = "column" padding={3}  >
            <Button onClick={async function(){
                    await save(dataToSave)
            }}   
            size="large"
            disabled={shouldButtonBeDisabled}
            variant="primary">
                Save
            </Button>
        </Box>
        </React.Fragment>

                </Box>
                
                </React.Fragment>             
            )}
                              
            
        </Box>
        
        </React.Fragment>
    );
}




function getChartData({records, xField, value1, value2, value3, chartType}) {
    const labels = [];
    const points = [];   
    const points2 = [];   
    const points3 = [];    

    for (const record of records) {
        const xValue = record.getCellValue(xField);
        const label = xValue === null ? 'Empty' : record.getCellValueAsString(xField);
        labels.push(label);

        const seriesValue1 = record.getCellValue(value1);    
        const point = seriesValue1 === null ? 0 : record.getCellValueAsString(value1);    
        points.push(point);
        
        const seriesValue2 = value2 ? record.getCellValue(value2): null;    
        const point2 = seriesValue2 === null ? 0 : record.getCellValueAsString(value2);    
        points2.push(point2);

        const seriesValue3 = value3 ? record.getCellValue(value3): null;    
        const point3 = seriesValue3 === null ? 0 : record.getCellValueAsString(value3);    
        points3.push(point3);



    }    
    
    

    const data = {
        labels,
        datasets: [
            {
                label: value1.name,
                //backgroundColor: '#2100f1',
                data: points,
                fill:false,
                
            }, 

        ],
    };
    if ( chartType == "line"){
        data.datasets[0]['borderColor'] = '#4d89f9';
    }

    if (value2){
        
        const data2 = value2 ?  {
            label: value2.name,
            //backgroundColor: '#4380f1',
            data: points2,
            fill:false,
            //borderColor:'#4380f1',
        }: null;

        if (value2 && chartType == "line"){
            data2['borderColor'] = '#00b88a';
        }

        data.datasets.push(data2)
    };
    
    if (value3){
        
        const data3 = value3 ?  {
            label: value3.name,
            //backgroundColor: '#21bbf1',
            data: points3, 
            fill:false,
            //borderColor:'#21bbf1',
        }: null;

        if (value3 && chartType == "line"){
            data3['borderColor'] = '#ff9f40';
        }


        data.datasets.push(data3)
    };
    


    return data;
}

function Settings({table}, value) {
       
    const options = [
        { value: "bar", label: "Bar" },
        { value: "line", label: "Line" },
        { value: "pie", label: "Pie Chart" }
    ];
    return (
        <Box display="flex" padding={3} borderBottom="thick" flexDirection = "column">
            <Box display="flex" padding={3} borderBottom="thick">
                <FormField label="Table" width="25%" paddingRight={1} marginBottom={0}>
                    <TablePickerSynced globalConfigKey={GlobalConfigKeys.TABLE_ID} />
                </FormField>
                {table && (
                    <FormField label="View" width="25%" paddingX={1} marginBottom={0}>
                        <ViewPickerSynced table={table} globalConfigKey={GlobalConfigKeys.VIEW_ID} />
                    </FormField>
                )}
                {table && (
                    <FormField label="Chart type" width="50%" paddingLeft={1} marginBottom={0}>
                       <SelectButtonsSynced
                        globalConfigKey={GlobalConfigKeys.CHART_TYPE}
                        options={options}
                        />
                    </FormField>
                )}

            </Box>
            <Box display="flex" padding={3} borderBottom="thick">
            {table && (
                    <FormField label="X-axis field" width="25%" paddingLeft={1} marginBottom={0}>
                        <FieldPickerSynced
                            table={table}
                            globalConfigKey={GlobalConfigKeys.X_FIELD_ID}
                        />
                    </FormField>
                )}
                {table && (
                    <FormField label="Series 1" width="25%" paddingLeft={1} marginBottom={0}>
                        <FieldPickerSynced
                            table={table}
                            globalConfigKey={GlobalConfigKeys.VALUE_1}
                        />
                    </FormField>
                )}
                {table && (
                    <FormField label="Series 2" width="25%" paddingLeft={1} marginBottom={0}>
                        <FieldPickerSynced
                            table={table}
                            globalConfigKey={GlobalConfigKeys.VALUE_2}
                            shouldAllowPickingNone={true}
                        />
                    </FormField>
                )}
                {table && (
                    <FormField label="Series 3" width="25%" paddingLeft={1} marginBottom={0}>
                        <FieldPickerSynced
                            table={table}
                            globalConfigKey={GlobalConfigKeys.VALUE_3}
                            shouldAllowPickingNone={true}
                        />
                    </FormField>
                )}
            </Box>
            
            
        </Box>
    );
}



async function save(dataToSave){
    
    const recordFields = {}
    
    dataToSave.linkId = dataToSave.tableSave.getFieldByIdIfExists(dataToSave.linkId) ? dataToSave.linkId : null;
    dataToSave.attachmentId = dataToSave.tableSave.getFieldByIdIfExists(dataToSave.attachmentId) ? dataToSave.attachmentId : null;

    if (dataToSave.linkId){
        recordFields[[dataToSave.linkId]] = dataToSave.chartUrl
    };
    
   

    if (dataToSave.attachmentId ){
        recordFields[[dataToSave.attachmentId]] = [{
            
                "filename": "chart.png",
                "url": dataToSave.chartUrl,
                
            
        }]
    };


    async function createNewRecordAsync(recordFields) {
        if (dataToSave.tableSave.hasPermissionToCreateRecord(recordFields)) {
            await dataToSave.tableSave.createRecordAsync(recordFields);
        }
        // New record has been saved to Airtable servers.
        alert(`new record has been created`);
    };

    createNewRecordAsync(recordFields);

}

initializeBlock(() => <SimpleChartBlock />);
