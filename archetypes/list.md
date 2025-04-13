---
title: "{{ replace .File.ContentBaseName "-" " " | title }}"
description: ""
slug: "{{ .File.ContentBaseName }}"
translationKey: "{{ .File.ContentBaseName }}"
language: "{{ .Site.Language.Lang }}"
date: {{ .Date }}
lastmod: {{ .Date }}
draft: true
tags: []
categories: ['list']
featured_image: ""
---
