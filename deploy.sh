#!/bin/bash

ssh J2kly@138.128.222.125 -t -p10999 "sudo rm -rf ~/html"
scp -r -P10999 public/ J2kly@138.128.222.125:~/html
ssh J2kly@138.128.222.125 -t -p10999 "sudo rm -rf /var/www/html" 
ssh J2kly@138.128.222.125 -t -p10999 "sudo cp -r ~/html/ /var/www/html"

