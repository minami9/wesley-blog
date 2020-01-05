#!/bin/bash

ssh J2kly@138.128.222.220 -t -p10999 "sudo rm -rf ~/html"
scp -r -P10999 public/ J2kly@138.128.222.220:~/html
ssh J2kly@138.128.222.220 -t -p10999 "sudo rm -rf /var/www/html" 
ssh J2kly@138.128.222.220 -t -p10999 "sudo cp -r ~/html/ /var/www/html"

