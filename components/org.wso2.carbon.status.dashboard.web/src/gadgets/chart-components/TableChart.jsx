/**
 * Copyright (c) WSO2 Inc. (http://wso2.com) All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *          http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { Component } from 'react';
import ReactTable from 'react-table';
import PropTypes from 'prop-types';
import { scaleLinear } from 'd3';
import 'react-table/react-table.css';
import './resources/css/tableChart.css';
import { getDefaultColorScale } from './helper';

class ReactTableTest extends Component {

    constructor(props) {
        super(props);
        this.state = {
            height: props.config.height || 450,
            width: props.config.width || 800,
            columnArray: [],
            dataSet: [],
            initialized: false,
            columnColorIndex: 0,
            colorScale: []
        };
    }

    componentDidMount() {
        this._handleData(this.props);
    }

    componentWillReceiveProps(nextProps) {
        this._handleData(nextProps);
    }

    /**
     * handles data received by the props and populate the table
     * @param props
     * @private
     */
    _handleData(props) {
        let { config, metadata, data } = props;
        let tableConfig = config.charts[0];
        let { dataSet, columnArray, initialized, columnColorIndex, colorScale } = this.state;
        colorScale = Array.isArray(tableConfig.colorScale) ? tableConfig.colorScale : getDefaultColorScale();

        if (columnColorIndex >= colorScale.length) {
            columnColorIndex = 0;
        }

        tableConfig.columns.map((column, i) => {
            let colIndex = metadata.names.indexOf(column);

            if (!initialized) {
                columnArray.push({
                    datIndex: colIndex,
                    title: tableConfig.columnTitles[i] || column,
                    accessor: column
                });
            }

            data.map((datum) => {
                if (metadata.types[colIndex] === 'linear') {
                    if (!columnArray[i].hasOwnProperty('range')) {
                        columnArray[i].range = [datum[colIndex], datum[colIndex]];
                        columnArray[i].color = colorScale[columnColorIndex++];
                    }

                    if (datum[colIndex] > columnArray[i].range[1]) {
                        columnArray[i].range[1] = datum[colIndex];
                    }

                    if (datum[colIndex] < columnArray[i].range[0]) {
                        columnArray[i].range[0] = datum[colIndex];
                    }
                } else {
                    if (!columnArray[i].hasOwnProperty('colorMap')) {
                        columnArray[i].colorIndex = 0;
                        columnArray[i].colorMap = {};
                    }

                    if (columnArray[i].colorIndex >= colorScale.length) {
                        columnArray[i].colorIndex = 0;
                    }

                    if (!columnArray[i].colorMap.hasOwnProperty(datum[colIndex])) {
                        columnArray[i].colorMap[datum[colIndex]] = colorScale[columnArray[i].colorIndex++];
                    }
                }
            });
        });

        data = data.map((d) => {
            let tmp = {};
            for (let i = 0; i < metadata.names.length; i++) {
                tmp[metadata.names[i]] = d[i];
            }

            return tmp;
        });

        initialized = true;
        dataSet = dataSet.concat(data);

        while (dataSet.length > config.maxLength) {
            dataSet.shift();
        }

        this.setState({
            dataSet: dataSet,
            columnColorIndex: columnColorIndex,
            columnArray: columnArray,
            initialized: initialized,
            colorScale: colorScale
        });
    }

    _getLinearColor(color, range, value) {
        return scaleLinear().range(['#fff', color]).domain(range)(value);
    }

    render() {
        let { config, metadata } = this.props;
        let { dataSet, columnArray } = this.state;
        let chartConfig = [];

        columnArray.map((column, i) => {
            let columnConfig = {
                Header: column.title,
                accessor: column.accessor,
            };
            if (config.colorBasedStyle) {
                columnConfig.Cell = props => (
                    <div
                        style={{
                            width: '100%',
                            height: '100%',
                            backgroundColor: column.range ? this._getLinearColor(column.color, column.range, props.value) : column.colorMap[props.value],
                            margin: 0,
                            textAlign: 'center'
                        }}
                    >
                        <span>{props.value}</span>
                    </div>);
            }

            chartConfig.push(
                columnConfig
            );
        });

        return (
            <ReactTable
                data={dataSet}
                columns={chartConfig}
                showPagination={false}
                minRows={config.maxLength}
            />
        );
    }
}

ReactTableTest.propTypes = {
    config: PropTypes.object.isRequired,
    metadata: PropTypes.object.isRequired,
    data: PropTypes.array
};

export default ReactTableTest;
