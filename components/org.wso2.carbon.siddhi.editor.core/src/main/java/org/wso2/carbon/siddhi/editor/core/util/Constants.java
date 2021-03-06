/*
 * Copyright (c) 2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

package org.wso2.carbon.siddhi.editor.core.util;

import org.wso2.siddhi.core.executor.function.FunctionExecutor;
import org.wso2.siddhi.core.query.processor.stream.StreamProcessor;
import org.wso2.siddhi.core.query.processor.stream.function.StreamFunctionProcessor;
import org.wso2.siddhi.core.query.processor.stream.window.WindowProcessor;
import org.wso2.siddhi.core.query.selector.attribute.aggregator.AttributeAggregator;
import org.wso2.carbon.utils.Utils;
import org.wso2.siddhi.core.stream.input.source.Source;
import org.wso2.siddhi.core.stream.input.source.SourceMapper;
import org.wso2.siddhi.core.stream.output.sink.Sink;
import org.wso2.siddhi.core.stream.output.sink.SinkMapper;
import org.wso2.siddhi.core.table.record.AbstractRecordTable;

import java.util.HashMap;
import java.util.Map;

/**
 * Constants related to Editor.
 */
public class Constants {
    public static final String RUNTIME_PATH = Utils.getRuntimePath().toString();
    public static final String CARBON_HOME = Utils.getCarbonHome().toString();
    public static final String DIRECTORY_DEPLOYMENT = "deployment";
    public static final String DIRECTORY_WORKSPACE = "workspace";
    public static final String SIDDHI_APP_FILE_EXTENSION = ".siddhi";
    static final String FUNCTION_EXECUTOR = "FunctionExecutor";
    static final String ATTRIBUTE_AGGREGATOR = "AttributeAggregator";
    static final String WINDOW_PROCESSOR = "WindowProcessor";
    static final String STREAM_FUNCTION_PROCESSOR = "StreamFunctionProcessor";
    static final String STREAM_PROCESSOR = "StreamProcessor";
    static final String SOURCE = "Source";
    static final String SINK = "Sink";
    static final String SOURCEMAP = "SourceMap";
    static final String SINKMAP = "SinkMap";
    static final String STORE = "Store";
    static final Map<String, Class<?>> SUPER_CLASS_MAP;
    static final Map<String, String> PACKAGE_NAME_MAP;

    static {
        // Populating the processor super class map
        SUPER_CLASS_MAP = new HashMap<>();
        SUPER_CLASS_MAP.put(FUNCTION_EXECUTOR, FunctionExecutor.class);
        SUPER_CLASS_MAP.put(ATTRIBUTE_AGGREGATOR, AttributeAggregator.class);
        SUPER_CLASS_MAP.put(WINDOW_PROCESSOR, WindowProcessor.class);
        SUPER_CLASS_MAP.put(STREAM_FUNCTION_PROCESSOR, StreamFunctionProcessor.class);
        SUPER_CLASS_MAP.put(STREAM_PROCESSOR, StreamProcessor.class);
        SUPER_CLASS_MAP.put(SOURCE, Source.class);
        SUPER_CLASS_MAP.put(SINK, Sink.class);
        SUPER_CLASS_MAP.put(SOURCEMAP, SourceMapper.class);
        SUPER_CLASS_MAP.put(SINKMAP, SinkMapper.class);
        SUPER_CLASS_MAP.put(STORE, AbstractRecordTable.class);

        // Populating the package name map
        PACKAGE_NAME_MAP = new HashMap<>();
        PACKAGE_NAME_MAP.put(FUNCTION_EXECUTOR, "org.wso2.siddhi.core.executor.function");
        PACKAGE_NAME_MAP.put(ATTRIBUTE_AGGREGATOR,
                "org.wso2.siddhi.core.query.selector.attribute.aggregator");
        PACKAGE_NAME_MAP.put(WINDOW_PROCESSOR, "org.wso2.siddhi.core.query.processor.stream.window");
    }
}
