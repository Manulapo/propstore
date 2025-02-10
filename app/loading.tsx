import spinner from '@/assets/loader.gif';
import Image from 'next/image';

const Loading = () => {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100vw',
            height: '100vh',
        }}>
            <Image
                src={spinner}
                height={150}
                width={150}
                alt='loading spinner' />
        </div>
    );
}

export default Loading;