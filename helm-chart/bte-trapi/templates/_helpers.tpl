{{/*
Expand the name of the chart.
*/}}
{{- define "bte-trapi.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Expand the fullname of the release.
*/}}
{{- define "bte-trapi.fullname" -}}
{{- printf "%s-%s" .Release.Name (include "bte-trapi.name" .) | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Create a chart label that includes the chart name and version.
*/}}
{{- define "bte-trapi.chart" -}}
{{ printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" }}
{{- end -}}

{{/*
Common labels for all resources.
*/}}
{{- define "bte-trapi.labels" -}}
app.kubernetes.io/name: {{ include "bte-trapi.name" . }}
helm.sh/chart: {{ include "bte-trapi.chart" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{/*
Generate the service account name.
*/}}
{{- define "bte-trapi.serviceAccountName" -}}
{{- if .Values.serviceAccount.name }}
{{- printf "%s" .Values.serviceAccount.name }}
{{- else }}
{{- include "bte-trapi.fullname" . }}
{{- end -}}
{{- end -}}
