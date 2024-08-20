{{- define "bte-trapi.name" -}}
{{ .Chart.Name }}
{{- end -}}

{{- define "bte-trapi.fullname" -}}
{{ .Release.Name }}-{{ include "bte-trapi.name" . }}
{{- end -}}
