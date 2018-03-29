#!/bin/bash
for k in $( seq 1 45 )
do
	index=`expr 400 + ${k}`
	# iconv -c -f GB2312 -t UTF-8 ./lrc2/E${index}.lrc > ./lrc/${index}.lrc
	cp -a ./mp32/E${index}.mp3 ./mp3/${index}.mp3
done
