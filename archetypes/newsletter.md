---
title: "{{ replace .Name \"-\" \" \" | title }}" # Titolo del numero
date: {{ .Date }} # Data di invio
slug: "{{ .Name }}" # Slug URL (es. numero-05)
language: "{{ .Site.Language.Lang }}" # Lingua (impostata dalla cartella)
translationKey: "" # Chiave per collegare traduzioni (se applicabile)
tags: ['newsletter']
categories: ['newsletter']
summary: "" # Breve riassunto per la lista
# Potremmo aggiungere campi specifici:
# issue_number: 0 # Numero progressivo
# mailerlite_campaign_id: "" # ID campagna MailerLite (opzionale)
---

Contenuto della newsletter qui...

Link all'articolo principale:

Call to action: 