---
title: "{{ replace .File.ContentBaseName "-" " " | title }}"
description: ""
layout: "newsletter"
issue_number: 
slug: "{{ .File.ContentBaseName }}"
translationKey: "{{ .File.ContentBaseName }}"
aliases: []
related_article_slug: ""
language: "{{ .Site.Language.Lang }}"
date: {{ .Date }}
lastmod: {{ .Date }}
draft: true
tags: []
categories: ['newsletter']
mailerlite_campaign_id: ""
---
