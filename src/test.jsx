

import React, { Component } from "react";
import { AgGridReact } from "@ag-grid-community/react";
import { AllCommunityModules } from "@ag-grid-community/all-modules";
import "@ag-grid-community/all-modules/dist/styles/ag-grid.css";
import "@ag-grid-community/all-modules/dist/styles/ag-theme-balham-dark.css";
import './test.css';
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import axios from "axios";
import { confirmAlert } from 'react-confirm-alert';
import swal from 'sweetalert';

class GridExample extends Component {
    constructor(props) {
        super(props);
        this.onUpdate = this.onUpdate.bind(this);
        this.setBooleanVal = this.setBooleanVal.bind(this);
        this.state = {
            isUpdate: false,
            modules: AllCommunityModules,
            rowData: [],
            columnDefs: [],
            defaultColDef: {
                editable: true,
                resizable: true
            }

        };
    }

    componentDidMount() {
        this.refreshData();
        this.loadData(this.setBooleanVal);
    }

    loadData(setBooleanVal) {

        let columnDefs = [
            {
                headerName: 'Name',
                field: "name",
                width: 100
            },
            {
                headerName: 'Email',
                field: "email",
                width: 100,
                valueGetter: function (params) {
                    return params.data.email;
                },
                valueSetter: function (params) {
                    const email = params.data.email.trim();
                    const newValue = params.newValue.trim();
                    if (email !== newValue) {
                        setBooleanVal(true);
                        params.data.email = newValue;
                        return true;
                    } else {
                        return false;
                    }
                }
            },
            {
                headerName: 'Emp Id',
                field: "id",
                width: 90
            }
            ,
            {
                headerName: 'Edit',
                field: "",
                width: 90,
                cellRendererFramework: (props) => (<button onClick={() => this.onBtStartEditing(props)}>Edit</button>)
            },
            {
                headerName: 'Update',
                field: "",
                width: 90,
                cellRendererFramework: (props) => (<button onClick={() => this.onUpdate(props)}>Update</button>)
            }
        ];
        this.setState({
            columnDefs: columnDefs
        })
    }
    setBooleanVal(val) {
        this.setState({
            isUpdate: val
        })
    }

    refreshData() {
        axios.get(`http://localhost:8080/demo/all`)
            .then(res => {
                console.log(res);
                this.setState({
                    rowData: res.data
                })
            }
            )
    }
    onGridReady = params => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;

        params.api.sizeColumnsToFit();
    };

    onBtStopEditing() {
        this.gridApi.stopEditing();
    }
    onBtStartEditing(props) {
        this.gridApi.setFocusedCell(props.rowIndex, "email");
        this.gridApi.startEditingCell({
            rowIndex: props.rowIndex,
            colKey: "email"
        });
    }
    onUpdate(props) {
        if (!this.state.isUpdate) {
            swal("Info", "Please edit the value first", "warning");
            return;
        }

        confirmAlert({
            title: 'Confirm to submit',
            message: 'Are you sure to do this.',
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => {
                        let axiosConfig = {
                            headers: {
                                'Content-Type': 'application/json;charset=UTF-8',
                                "Access-Control-Allow-Origin": "*",
                            }
                        };
                        console.log(this.state.isUpdate);
                        let data = {
                            id: +props.data.id,
                            email: props.data.email
                        }
                        axios.post(`http://localhost:8080/demo/update`, data, axiosConfig)
                            .then(res => {
                                this.setBooleanVal(false);
                                swal("Update", "Data Updated Successfuly.", "success");
                            }
                            );
                    }
                },
                {
                    label: 'No',
                    onClick: () => this.refreshData()
                }
            ]
        });
    }


    render() {
        return (
            <div >


                <div
                    id="myGrid"

                    className="ag-theme-balham-dark"
                >
                    <AgGridReact
                        modules={this.state.modules}
                        columnDefs={this.state.columnDefs}
                        rowData={this.state.rowData}
                        defaultColDef={this.state.defaultColDef}
                        suppressClickEdit={true}
                        onGridReady={this.onGridReady}

                    />
                </div>
            </div>

        );
    }
}


export default GridExample;