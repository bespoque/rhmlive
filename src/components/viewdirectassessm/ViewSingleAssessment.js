import Widget from '../widget'
import SectionTitle from '../section-title';
import { StartSingleIndividualAssessment } from '../assessment/viewAssessment';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from "axios";
import Loader from 'react-loader-spinner';
import setAuthToken from '../../functions/setAuthToken';
import url from '../../config/url';

const ViewSingleDirectAssessment = () => {
  const router = useRouter();
  const [payerprop, setpayerprop] = useState([]);
  const [isFetching, setIsFetching] = useState(() => true);

  useEffect(() => {
    if (router && router.query) {
      let kgtin = router.query.ref;
      let kgtinPost = {
        "KGTIN": `${kgtin}`
      }
      console.log(kgtin);
      setAuthToken();
      const fetchPost = async () => {
        try {
          let res = await axios.post(`${url.BASE_URL}taxpayer/view-individual`, kgtinPost);
            let IndData = res.data.body
            setpayerprop(IndData)
            setIsFetching(false);
        } catch (err) {
          console.log(err);
          setIsFetching(false);
        }
      };
      fetchPost();
    }
  }, [router]);

  return (
    
    <>
  
      <SectionTitle title="Start Individual Direct Assessment" />
     
      <Widget>

      {isFetching ? (
        <div className="flex justify-center item mb-2">
          <Loader
            visible={isFetching}
            type="BallTriangle"
            color="#00FA9A"
            height={19}
            width={19}
            timeout={0}
            className="ml-2"
          />
          <p>Fetching data...</p>
        </div>
      ): <StartSingleIndividualAssessment payerprop={payerprop}/>}
          
       
      </Widget>
    </>
  );
}
export default ViewSingleDirectAssessment