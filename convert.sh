#!/bin/bash
for k in $( seq -f "%03g" 1 99 )
do
	target=`expr 100 + ${k}`

	if [ -e /lrc2/E${k}.lrc ]
	then
		iconv -c -f GB2312 -t UTF-8 ./lrc2/E${k}.lrc > ./lrc/${target}.lrc
		cp -a ./mp32/E${k}.mp3 ./mp3/${target}.mp3
	fi
done
