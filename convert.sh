#!/bin/bash
for k in $( seq 1 96 )
do
	index=`expr 200 + ${k}`
	iconv -c -f GB2312 -t UTF-8 ./lrc/C${index}.lrc > ./lrc2/${index}.lrc
done
