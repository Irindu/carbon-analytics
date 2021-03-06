/**
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

define(['require', 'lodash', 'jquery', 'log', 'backbone', 'file_browser', 'bootstrap', 'ace/ace'], function (require, _, $, log, Backbone, FileBrowser, ace) {
    var DeleteConfirmDialog = Backbone.View.extend(
        /** @lends SaveToFileDialog.prototype */
        {
            /**
             * @augments Backbone.View
             * @constructs
             * @class SaveToFileDialog
             * @param {Object} config configuration options for the SaveToFileDialog
             */
            initialize: function (options) {
                this.app = options;
                this.dialog_container = $(_.get(options.config.dialog, 'container'));
                this.notification_container = _.get(options.config.tab_controller.tabs.tab.das_editor.notifications,
                    'container');
            },

            show: function () {
                var self = this;
                this._fileDeleteModal.modal('show').on('shown.bs.modal', function () {
                    self.trigger('loaded');
                });
                this._fileDeleteModal.on('hidden.bs.modal', function () {
                    self.trigger('unloaded');
                })
            },

            setSelectedFile: function (path, fileName) {
                this._fileBrowser.select(path);
                if (!_.isNil(this._configNameInput)) {
                    this._configNameInput.val(fileName);
                }
            },

            render: function () {
                var self = this;
                var fileBrowser;
                var app = this.app;
                var notification_container = this.notification_container;
                var workspaceServiceURL = app.config.services.workspace.endpoint;
                var activeTab = app.tabController.activeTab;
                var siddhiFileEditor = activeTab.getSiddhiFileEditor();
                var content = siddhiFileEditor.getContent();
                var providedFileName = activeTab.getTitle();
                
                if (!_.isNil(this._fileDeleteModal)) {
                    this._fileDeleteModal.remove();
                }

                var fileDelete = $(
                    "<div class='modal fade' id='deleteAppModal' tabindex='-1' role='dialog' aria-tydden='true'>" +
                    "<div class='modal-dialog file-dialog' role='document'>" +
                    "<div class='modal-content'>" +
                    "<div class='modal-header'>" +
                    "<button type='button' class='close' data-dismiss='modal' aria-label='Close'>" +
                    "<span aria-hidden='true'>&times;</span>" +
                    "</button>" +
                    "<h4 class='modal-title file-dialog-title' id='newConfigModalLabel'>Delete from Workspace</h4>" +
                    "<hr class='style1'>" +
                    "</div>" +
                    "<div class='modal-body'>" +
                    "<div class='container-fluid'>" +
                    "<form class='form-horizontal' onsubmit='return false'>" +
                    "<div class='form-group'>" +
                    "<label for='configName' class='col-sm-9 file-dialog-label'>" +
                    "Are you sure to delete Siddhi App: " + providedFileName + "" +
                    "</label>" +
                    "</div>" +
                    "<div class='form-group'>" +
                    "<div class='file-dialog-form-btn'>" +
                    "<button id='deleteButton' type='button' class='btn btn-primary'>delete" +
                    "</button>" +
                    "<div class='divider'/>" +
                    "<button type='cancelButton' class='btn btn-default' data-dismiss='modal'>cancel</button>" +
                    "</div>" +
                    "</form>" +
                    "<div id='deleteWizardError' class='alert alert-danger'>" +
                    "<strong>Error!</strong> Something went wrong." +
                    "</div>" +
                    "</div>" +
                    "</div>" +
                    "</div>" +
                    "</div>" +
                    "</div>"
                );

                var successNotification = $(
                    "<div style='z-index: 9999;' style='line-height: 20%;' class='alert alert-success' id='success-alert'>" +
                    "<span class='notification'>" +
                    "Siddhi app deleted successfully !" +
                    "</span>" +
                    "</div>");

                function getErrorNotification(detailedErrorMsg) {
                    var errorMsg = "Error while deleting Siddhi app";
                    if (!_.isEmpty(detailedErrorMsg)) {
                        errorMsg += (" : " + detailedErrorMsg);
                    }
                    return $(
                        "<div style='z-index: 9999;' style='line-height: 20%;' class='alert alert-danger' id='error-alert'>" +
                        "<span class='notification'>" +
                        errorMsg +
                        "</span>" +
                        "</div>");
                }

                var deleteAppModal = fileDelete.filter("#deleteAppModal");
                var deleteWizardError = fileDelete.find("#deleteWizardError");
                var location = fileDelete.find("input").filter("#location");
                var configName = fileDelete.find("input").filter("#configName");
                this._configNameInput = configName;

                //Gets the selected location from tree and sets the value as location
                this.listenTo(fileBrowser, 'selected', function (selectedLocation) {
                    if (selectedLocation) {
                        location.val(selectedLocation);
                    }
                });

                fileDelete.find("button").filter("#deleteButton").click(function () {
                    var _location = location.val();
                    var _configName = configName.val();
                    var replaceContent = false;

                    if (_.isEmpty(_configName)) {
                        _configName = providedFileName;
                    } else {
                        _configName = _configName.trim();
                    }

                    if (!_configName.endsWith(".siddhi")) {
                        _configName = _configName + ".siddhi";
                    }

                    if (_configName != providedFileName) {
                        replaceContent = true;
                    }

                    var callback = function (isDeleted) {
                        self.trigger('save-completed', isDeleted);
                        deleteAppModal.modal('hide');
                    };

                    var existsResponse = existFileInPath({configName: _configName});

                    if (existsResponse.exists) {
                        deleteSiddhiApp({
                            location: _location,
                            configName: _configName,
                            replaceContent: replaceContent,
                            oldAppName: providedFileName
                        }, callback);
                    } else {
                        deleteWizardError.text("File doesn't exists in workspace");
                        deleteWizardError.show();
                    }

                });

                $(this.dialog_container).append(fileDelete);
                deleteWizardError.hide();
                this._fileDeleteModal = fileDelete;

                function alertSuccess() {
                    $(notification_container).append(successNotification);
                    successNotification.fadeTo(2000, 200).slideUp(1000, function () {
                        successNotification.slideUp(1000);
                    });
                }

                function alertError(errorMessage) {
                    var errorNotification = getErrorNotification(errorMessage);
                    $(notification_container).append(errorNotification);
                    errorNotification.fadeTo(2000, 200).slideUp(1000, function () {
                        errorNotification.slideUp(1000);
                    });
                }

                function isJsonString(str) {
                    try {
                        JSON.parse(str);
                    } catch (e) {
                        return false;
                    }
                    return true;
                }

                function existFileInPath(options) {
                    var client = self.app.workspaceManager.getServiceClient();
                    var data = {};
                    var workspaceServiceURL = app.config.services.workspace.endpoint;
                    var saveServiceURL = workspaceServiceURL + "/exists/workspace";
                    var payload = "configName=" + btoa(options.configName);

                    $.ajax({
                        type: "POST",
                        contentType: "text/plain; charset=utf-8",
                        url: saveServiceURL,
                        data: payload,
                        async: false,
                        success: function (response) {
                            data = response;
                        },
                        error: function (xhr, textStatus, errorThrown) {
                            data = client.getErrorFromResponse(xhr, textStatus, errorThrown);
                            log.error(data.message);
                        }
                    });
                    return data;
                }

                function deleteSiddhiApp(options, callback) {
                    var activeTab = app.tabController.activeTab;
                    $.ajax({
                        url: workspaceServiceURL + "/delete?siddhiAppName=" + options.oldAppName + "",
                        type: "DELETE",
                        contentType: "application/json; charset=utf-8",
                        async: false,
                        success: function (data, textStatus, xhr) {
                            if (xhr.status == 200) {
                                app.tabController.removeTab(activeTab);
                                deleteAppModal.modal('hide');
                                log.debug('file deleted successfully');
                                callback(true);
                                app.commandManager.dispatch("open-folder", data.path);
                                alertSuccess();
                            } else {
                                callback(false);
                                alertError(data.Error)
                            }
                        },
                        error: function (res, errorCode, error) {
                            var msg = _.isString(error) ? error : res.statusText;
                            if (isJsonString(res.responseText)) {
                                var resObj = JSON.parse(res.responseText);
                                if (_.has(resObj, 'Error')) {
                                    msg = _.get(resObj, 'Error');
                                }
                            }
                            alertError(msg);
                            callback(false);
                        }
                    });
                }
            }
        });

    return DeleteConfirmDialog;
});
